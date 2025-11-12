import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Parse and import JSON report
router.post('/import', async (req, res, next) => {
  try {
    const { reportData, reportType } = req.body;
    
    if (!reportData) {
      return res.status(400).json({ error: 'Report data is required' });
    }

    let parsedData;
    try {
      parsedData = typeof reportData === 'string' ? JSON.parse(reportData) : reportData;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    const results = {
      servers: 0,
      vulnerabilities: 0,
      ports: 0,
      patches: 0,
      logs: 0,
      errors: []
    };

    // Auto-detect report type if not specified
    const detectedType = reportType || detectReportType(parsedData);

    switch (detectedType) {
      case 'nmap':
        await processNmapReport(parsedData, results);
        break;
      case 'nessus':
        await processNessusReport(parsedData, results);
        break;
      case 'vulnerability':
        await processVulnerabilityReport(parsedData, results);
        break;
      case 'generic':
        await processGenericReport(parsedData, results);
        break;
      default:
        return res.status(400).json({ error: 'Unknown report type. Supported: nmap, nessus, vulnerability, generic' });
    }

    res.json({
      success: true,
      message: 'Report imported successfully',
      reportType: detectedType,
      results
    });
  } catch (error) {
    next(error);
  }
});

// Detect report type based on structure
function detectReportType(data) {
  if (data.nmaprun || data.scaninfo) return 'nmap';
  if (data.Report || data.Policy) return 'nessus';
  if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) return 'vulnerability';
  if (data.servers || data.hosts) return 'generic';
  return 'generic';
}

// Process Nmap report
async function processNmapReport(data, results) {
  const hosts = data.hosts || data.host || [];
  const hostsArray = Array.isArray(hosts) ? hosts : [hosts];

  for (const host of hostsArray) {
    try {
      const ip = host.address || host.ip || host.addr;
      const status = host.status === 'up' || host.state === 'up' ? 'online' : 'offline';
      const hostname = host.hostname || host.hostnames?.[0] || `Server ${ip}`;

      // Create or update server
      const serverResult = await query(
        `INSERT INTO servers (name, ip, status) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (ip) DO UPDATE 
         SET status = $3, updated_at = NOW()
         RETURNING id`,
        [hostname, ip, status]
      );
      
      const serverId = serverResult.rows[0].id;
      results.servers++;

      // Process ports
      const ports = host.ports?.port || host.port || [];
      const portsArray = Array.isArray(ports) ? ports : [ports];

      for (const port of portsArray) {
        const portNumber = parseInt(port.portid || port.number);
        const protocol = port.protocol || 'tcp';
        const state = port.state?.state || port.state || 'unknown';
        const service = port.service?.name || port.service || 'unknown';
        const version = port.service?.version || port.version || '';

        await query(
          `INSERT INTO ports (server_id, port, protocol, state, service, version)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (server_id, port, protocol) DO UPDATE
           SET state = $4, service = $5, version = $6`,
          [serverId, portNumber, protocol, state, service, version]
        );
        results.ports++;
      }
    } catch (error) {
      results.errors.push(`Error processing host: ${error.message}`);
    }
  }
}

// Process Nessus report
async function processNessusReport(data, results) {
  const reportHosts = data.Report?.ReportHost || data.ReportHost || [];
  const hostsArray = Array.isArray(reportHosts) ? reportHosts : [reportHosts];

  for (const reportHost of hostsArray) {
    try {
      const ip = reportHost.name || reportHost.HostProperties?.tag?.find(t => t.name === 'host-ip')?.value;
      const hostname = reportHost.HostProperties?.tag?.find(t => t.name === 'host-fqdn')?.value || `Server ${ip}`;

      const serverResult = await query(
        `INSERT INTO servers (name, ip, status)
         VALUES ($1, $2, 'online')
         ON CONFLICT (ip) DO UPDATE
         SET updated_at = NOW()
         RETURNING id`,
        [hostname, ip]
      );
      
      const serverId = serverResult.rows[0].id;
      results.servers++;

      // Process vulnerabilities
      const items = reportHost.ReportItem || [];
      const itemsArray = Array.isArray(items) ? items : [items];

      for (const item of itemsArray) {
        const severity = parseInt(item.severity || 0);
        const severityMap = { 0: 'info', 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };
        
        await query(
          `INSERT INTO vulnerabilities (server_id, title, description, severity, cve_id, cvss_score)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            serverId,
            item.pluginName || item.plugin_name || 'Unknown vulnerability',
            item.description || item.synopsis || '',
            severityMap[severity] || 'info',
            item.cve || item.cve_id || null,
            parseFloat(item.cvss_base_score || item.cvss || 0)
          ]
        );
        results.vulnerabilities++;
      }
    } catch (error) {
      results.errors.push(`Error processing Nessus host: ${error.message}`);
    }
  }
}

// Process vulnerability report
async function processVulnerabilityReport(data, results) {
  const vulnerabilities = data.vulnerabilities || [];

  for (const vuln of vulnerabilities) {
    try {
      const ip = vuln.host || vuln.ip || vuln.server_ip;
      
      // Get or create server
      let serverId;
      const serverCheck = await query('SELECT id FROM servers WHERE ip = $1', [ip]);
      
      if (serverCheck.rows.length > 0) {
        serverId = serverCheck.rows[0].id;
      } else {
        const serverResult = await query(
          `INSERT INTO servers (name, ip, status) VALUES ($1, $2, 'online') RETURNING id`,
          [`Server ${ip}`, ip]
        );
        serverId = serverResult.rows[0].id;
        results.servers++;
      }

      // Add vulnerability
      await query(
        `INSERT INTO vulnerabilities (server_id, title, description, severity, cve_id, cvss_score)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          serverId,
          vuln.title || vuln.name || 'Unknown',
          vuln.description || vuln.details || '',
          vuln.severity?.toLowerCase() || 'medium',
          vuln.cve || vuln.cve_id || null,
          parseFloat(vuln.cvss || vuln.score || 0)
        ]
      );
      results.vulnerabilities++;
    } catch (error) {
      results.errors.push(`Error processing vulnerability: ${error.message}`);
    }
  }
}

// Process generic server report
async function processGenericReport(data, results) {
  const servers = data.servers || data.hosts || [];

  for (const server of servers) {
    try {
      // Create server
      const serverResult = await query(
        `INSERT INTO servers (name, ip, status, critical, high, medium, low)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (ip) DO UPDATE
         SET name = $1, status = $3, critical = $4, high = $5, medium = $6, low = $7, updated_at = NOW()
         RETURNING id`,
        [
          server.name || server.hostname || `Server ${server.ip}`,
          server.ip || server.address,
          server.status || 'online',
          server.critical || 0,
          server.high || 0,
          server.medium || 0,
          server.low || 0
        ]
      );
      
      const serverId = serverResult.rows[0].id;
      results.servers++;

      // Process vulnerabilities if present
      if (server.vulnerabilities && Array.isArray(server.vulnerabilities)) {
        for (const vuln of server.vulnerabilities) {
          await query(
            `INSERT INTO vulnerabilities (server_id, title, description, severity, cve_id, cvss_score)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              serverId,
              vuln.title || vuln.name,
              vuln.description || '',
              vuln.severity?.toLowerCase() || 'medium',
              vuln.cve || null,
              parseFloat(vuln.cvss || 0)
            ]
          );
          results.vulnerabilities++;
        }
      }

      // Process ports if present
      if (server.ports && Array.isArray(server.ports)) {
        for (const port of server.ports) {
          await query(
            `INSERT INTO ports (server_id, port, protocol, state, service, version)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (server_id, port, protocol) DO UPDATE
             SET state = $4, service = $5, version = $6`,
            [
              serverId,
              parseInt(port.port || port.number),
              port.protocol || 'tcp',
              port.state || port.status || 'open',
              port.service || port.name || 'unknown',
              port.version || ''
            ]
          );
          results.ports++;
        }
      }

      // Process patches if present
      if (server.patches && Array.isArray(server.patches)) {
        for (const patch of server.patches) {
          await query(
            `INSERT INTO patches (server_id, patch_id, title, severity, release_date, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              serverId,
              patch.id || patch.patch_id,
              patch.title || patch.name,
              patch.severity || 'medium',
              patch.release_date || new Date().toISOString(),
              patch.status || 'pending'
            ]
          );
          results.patches++;
        }
      }

      // Process logs if present
      if (server.logs && Array.isArray(server.logs)) {
        for (const log of server.logs) {
          await query(
            `INSERT INTO logs (server_id, level, message, source)
             VALUES ($1, $2, $3, $4)`,
            [
              serverId,
              log.level || 'info',
              log.message || log.msg,
              log.source || 'import'
            ]
          );
          results.logs++;
        }
      }
    } catch (error) {
      results.errors.push(`Error processing server: ${error.message}`);
    }
  }
}

export default router;
