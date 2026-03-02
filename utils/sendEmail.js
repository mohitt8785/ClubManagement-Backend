import axios from "axios";

const sendEntryConfirmation = async ({
  name,
  surname,
  email,
  srNo,
  tableNo,
  entryTime,
}) => {
  try {
    if (!email) return;

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Jaguar Club", email: "01growth.project@gmail.com" },
        to: [{ email }],
        subject: `Jaguar Club - Entry Confirmed! SR #${srNo}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#0A0A0F;font-family:'Georgia',serif">
            
            <div style="max-width:600px;margin:0 auto;background:#12121A">
              
              <!-- Hero Header -->
              <div style="background:linear-gradient(180deg,#0A0A0F 0%,#1A1820 100%);padding:60px 40px;text-align:center;position:relative">
                <div style="color:#8A8071;font-size:10px;letter-spacing:4px;margin-bottom:30px">EST. 2018</div>
                
                <div style="color:#8A8071;font-size:11px;letter-spacing:3px;margin-bottom:20px">THE EXCLUSIVE</div>
                <h1 style="color:#E8C96A;font-size:48px;font-weight:400;margin:0 0 10px;letter-spacing:8px;font-family:'Garamond',serif">JAGUAR<br>CLUB</h1>
                <div style="width:60px;height:1px;background:#C9A84C;margin:20px auto"></div>
                <div style="width:4px;height:4px;background:#C9A84C;border-radius:50%;margin:0 auto"></div>
                <div style="width:60px;height:1px;background:#C9A84C;margin:8px auto 20px"></div>
                
                <div style="color:#B8B5A8;font-size:16px;font-style:italic;margin-bottom:8px">Where Every Night</div>
                <div style="color:#8A8071;font-size:14px;font-style:italic">Becomes a Legend</div>
              </div>
              
              <!-- Entry Confirmation -->
              <div style="padding:40px;background:#12121A">
                <h2 style="color:#E8C96A;font-size:22px;font-weight:400;margin:0 0 20px;text-align:center;letter-spacing:2px">Entry Confirmed</h2>
                
                <p style="color:#B8B5A8;font-size:15px;text-align:center;margin:0 0 30px;line-height:1.6">Dear ${name} ${surname},<br>Your reservation has been confirmed.</p>
                
                <!-- SR Number Card -->
                <div style="background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05));border:2px solid rgba(201,168,76,0.4);padding:30px;text-align:center;margin:0 0 30px">
                  <div style="color:#8A8071;font-size:10px;letter-spacing:3px;margin-bottom:12px">YOUR SR NUMBER</div>
                  <div style="color:#E8C96A;font-size:52px;font-weight:300;letter-spacing:4px">#${srNo}</div>
                  <div style="color:#8A8071;font-size:11px;margin-top:12px;font-style:italic">Present at entrance</div>
                </div>
                
                <!-- Entry Details -->
                <div style="border:1px solid rgba(201,168,76,0.2);padding:25px">
                  <div style="display:flex;justify-content:space-between;padding:15px 0;border-bottom:1px solid rgba(201,168,76,0.1)">
                    <span style="color:#8A8071;font-size:12px;letter-spacing:2px">TABLE NUMBER</span>
                    <span style="color:#E8C96A;font-size:18px;font-weight:300">${tableNo}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:15px 0">
                    <span style="color:#8A8071;font-size:12px;letter-spacing:2px">ENTRY TIME</span>
                    <span style="color:#E8C96A;font-size:18px;font-weight:300">${entryTime}</span>
                  </div>
                </div>
              </div>
              
              <!-- Experience Section -->
              <div style="padding:40px;background:#0A0A0F">
                <div style="text-align:center;margin-bottom:30px">
                  <div style="color:#C9A84C;font-size:11px;letter-spacing:3px;margin-bottom:15px">TONIGHT'S EXPERIENCE</div>
                  <div style="width:40px;height:1px;background:#C9A84C;margin:0 auto"></div>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:30px">
                  <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.2);padding:20px;text-align:center">
                    <div style="color:#E8C96A;font-size:24px;margin-bottom:8px">🎵</div>
                    <div style="color:#B8B5A8;font-size:11px;letter-spacing:1px">LIVE MUSIC</div>
                  </div>
                  <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.2);padding:20px;text-align:center">
                    <div style="color:#E8C96A;font-size:24px;margin-bottom:8px">🍸</div>
                    <div style="color:#B8B5A8;font-size:11px;letter-spacing:1px">CURATED SPIRITS</div>
                  </div>
                  <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.2);padding:20px;text-align:center">
                    <div style="color:#E8C96A;font-size:24px;margin-bottom:8px">💎</div>
                    <div style="color:#B8B5A8;font-size:11px;letter-spacing:1px">PREMIUM LOUNGE</div>
                  </div>
                  <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.2);padding:20px;text-align:center">
                    <div style="color:#E8C96A;font-size:24px;margin-bottom:8px">✨</div>
                    <div style="color:#B8B5A8;font-size:11px;letter-spacing:1px">VIP EXPERIENCES</div>
                  </div>
                </div>
              </div>
              
              
              <!-- Club Guidelines -->
              <div style="padding:40px;background:#0A0A0F">
                <div style="text-align:center;margin-bottom:25px">
                  <div style="color:#C9A84C;font-size:11px;letter-spacing:3px">CLUB ETIQUETTE</div>
                </div>
                <ul style="list-style:none;padding:0;margin:0;color:#8A8071;font-size:12px;line-height:2">
                  <li style="padding:8px 0;border-bottom:1px solid rgba(201,168,76,0.1)">• Smart casual dress code required</li>
                  <li style="padding:8px 0;border-bottom:1px solid rgba(201,168,76,0.1)">• Valid identification mandatory (21+ only)</li>
                  <li style="padding:8px 0;border-bottom:1px solid rgba(201,168,76,0.1)">• Outside beverages not permitted</li>
                  <li style="padding:8px 0">• Management reserves right to admission</li>
                </ul>
              </div>
              
              <!-- Location & Contact -->
              <div style="padding:40px;background:#12121A;text-align:center">
                <div style="color:#C9A84C;font-size:11px;letter-spacing:3px;margin-bottom:25px">FIND US</div>
                
                <div style="border:1px solid rgba(201,168,76,0.2);padding:20px;margin-bottom:25px">
                  <div style="color:#E8C96A;font-size:14px;margin-bottom:8px">📍 SCO 37-40, Oxford Street</div>
                  <div style="color:#8A8071;font-size:12px">Zirakpur, Mohali — 140603</div>
                </div>
                
                <div style="margin-bottom:25px">
                  <div style="color:#B8B5A8;font-size:13px;margin-bottom:6px">📞 +91 6280 372744</div>
                  <div style="color:#B8B5A8;font-size:13px">📞 +91 6280 382744</div>
                </div>
                
              </div>
              
              <!-- Footer -->
              <div style="padding:30px 40px;background:#0A0A0F;border-top:1px solid rgba(201,168,76,0.15);text-align:center">
                <div style="color:#5A5766;font-size:10px;letter-spacing:2px;margin-bottom:8px">JAGUAR CLUB ENTRY MANAGEMENT</div>
                <div style="color:#3d3a50;font-size:9px">© 2026 Jaguar Club. All rights reserved.</div>
              </div>
              
            </div>
            
          </body>
          </html>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`✅ Premium email sent to ${email}`);
  } catch (err) {
    console.error("❌ Email error:", err.response?.data || err.message);
  }
};

export default sendEntryConfirmation;
