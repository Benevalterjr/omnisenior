import { NextResponse } from 'next/server';
import dgram from 'dgram';

// Official NTP.br servers from NIC.br and Observatório Nacional
const NTP_SERVERS = ['a.st1.ntp.br', 'b.st1.ntp.br', 'pool.ntp.br'];

function queryNtpServer(server: string, timeoutMs: number = 2500): Promise<{ timestamp: number; server: string }> {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const client = dgram.createSocket('udp4');
    const packet = Buffer.alloc(48);
    // LI = 0, VN = 3, Mode = 3 (Client)
    packet[0] = 0x1b;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { client.close(); } catch (_) {}
        reject(new Error(`Timeout ao conectar com ${server}`));
      }
    }, timeoutMs);

    client.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        try { client.close(); } catch (_) {}
        reject(err);
      }
    });

    client.on('message', (msg) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        try {
          // Transmit Timestamp is at byte 40 (seconds since 1900)
          const secondsSince1900 = msg.readUInt32BE(40);
          const fraction = msg.readUInt32BE(44);
          // NTP epoch is 1900-01-01, Unix epoch is 1970-01-01 (difference is 2,208,988,800 seconds)
          const secondsSince1970 = secondsSince1900 - 2208988800;
          const milliseconds = Math.floor((fraction / 0x100000000) * 1000);
          const timestamp = (secondsSince1970 * 1000) + milliseconds;

          try { client.close(); } catch (_) {}
          resolve({ timestamp, server });
        } catch (parseErr) {
          try { client.close(); } catch (_) {}
          reject(parseErr);
        }
      }
    });

    client.send(packet, 0, packet.length, 123, server, (err) => {
      if (err && !resolved) {
        resolved = true;
        clearTimeout(timer);
        try { client.close(); } catch (_) {}
        reject(err);
      }
    });
  });
}

export async function GET() {
  const requestReceivedAt = Date.now();

  // Try NTP.br servers in order
  for (const server of NTP_SERVERS) {
    try {
      const result = await queryNtpServer(server, 2000);
      return NextResponse.json({
        timestamp: result.timestamp,
        source: `${result.server} (NTP.br / NIC.br - Observatório Nacional)`,
        timezone: 'America/Sao_Paulo',
        utcOffset: '-03:00',
        requestReceivedAt,
        responseSentAt: Date.now()
      });
    } catch (error) {
      // Continue to next server in pool
      continue;
    }
  }

  // Fallback to server local time if UDP port 123 is blocked in hosting sandbox
  return NextResponse.json({
    timestamp: Date.now(),
    source: 'Horário do Servidor (Fallback NTP.br)',
    timezone: 'America/Sao_Paulo',
    utcOffset: '-03:00',
    requestReceivedAt,
    responseSentAt: Date.now()
  });
}
