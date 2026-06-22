const { createClient } = require("@supabase/supabase-js");
const { WebSocket } = require("ws");

const url = "https://eagxxwzujnkwvzcmdhwh.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZ3h4d3p1am5rd3Z6Y21kaHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MzMxMjEsImV4cCI6MjA5NzUwOTEyMX0.y0NBG_LCHanFMeYRczhhCelJx_EDJcUH84fHT3Rc1qg";

const supabase = createClient(url, key, {
    realtime: { transport: WebSocket }
});

function uploadFile(fileBuffer, fileName) {
    return new Promise(async (resolve, reject) => {
        const timeStamp = Date.now();
        const finalName = timeStamp + "_" + fileName;

        console.log('[mediaUploads] Uploading:', finalName, 'Size:', fileBuffer.length, 'bytes');

        const { data, error } = await supabase.storage
            .from("cvs")
            .upload(finalName, fileBuffer, {
                contentType: "application/pdf",
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error('[mediaUploads] Upload FAILED:', error.message);
            reject(new Error('Supabase upload failed: ' + error.message));
            return;
        }

        console.log('[mediaUploads] Upload success:', data);

        const { data: urlData } = supabase.storage
            .from("cvs")
            .getPublicUrl(finalName);

        console.log('[mediaUploads] Public URL:', urlData.publicUrl);
        resolve(urlData.publicUrl);
    });
}

module.exports = { uploadFile };