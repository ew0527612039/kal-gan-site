// גשר בין ימות המשיח לבין קל גן (Google Apps Script)
// ימות המשיח לא עוקבים אחרי ההפניה (redirect) שגוגל מחזירה – הגשר עושה את זה במקומם ומחזיר להם טקסט נקי.
const TARGET = 'https://script.google.com/macros/s/AKfycbx1S1OEbhTtgp_j4PyiEPCTwTtD25FZUO8pmNYHj9z1ZbzAt_0_uW-UImWbz9hH1_UVCg/exec';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let query = url.search;
    if (request.method === 'POST') {
      // ימות המשיח עם api_url_post=yes – מעבירים את השדות כפרמטרים בכתובת
      const body = await request.text();
      query = (query ? query + '&' : '?') + body;
    }
    if (!/[?&]key=/.test(query)) return new Response('ok', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    try {
      const r = await fetch(TARGET + query, { method: 'GET', redirect: 'follow' });
      const text = await r.text();
      return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
    } catch (e) {
      return new Response('id_list_message=t-המערכת אינה זמינה כרגע נא לנסות שוב מאוחר יותר&go_to_folder=hangup&', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
  }
};
