// גשר בין ימות המשיח לבין קל גן (Google Apps Script)
// ימות המשיח לא עוקבים אחרי ההפניה (redirect) שגוגל מחזירה – הגשר עושה את זה במקומם ומחזיר להם טקסט נקי.
// כל תקלה נאמרת בקול למתקשר, כדי שיהיה קל לאבחן.
const TARGET = 'https://script.google.com/macros/s/AKfycbx1S1OEbhTtgp_j4PyiEPCTwTtD25FZUO8pmNYHj9z1ZbzAt_0_uW-UImWbz9hH1_UVCg/exec';
const H = { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' };
const say = t => new Response('id_list_message=t-' + t + '&go_to_folder=hangup&', { headers: H });

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let query = url.search;
    if (request.method === 'POST') { const body = await request.text(); if (body) query = (query ? query + '&' : '?') + body; }
    const fromYemot = /[?&](ApiCallId|ApiPhone)=/.test(query);
    console.log('IN', request.method, query.replace(/key=[^&]*/, 'key=***'));
    if (!/[?&]key=/.test(query)) return fromYemot ? say('הגשר פועל אבל בהגדרות השלוחה חסרה השורה של המפתח') : new Response('ok - kal gan bridge', { headers: H });
    let text = '';
    try {
      const r = await fetch(TARGET + query, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'kal-gan-bridge' } });
      text = (await r.text()).trim();
      console.log('OUT', r.status, text.slice(0, 300));
    } catch (e) {
      console.log('ERR', String(e));
      return say('הגשר פועל אבל לא הצליח להגיע לשרת של קל גן');
    }
    if (/^(read|id_list_message|go_to_folder|go_to_folder_and_play|noop|routing|routing_yemot|music_on_hold)=/.test(text)) return new Response(text, { headers: H });
    if (/accounts\.google|ServiceLogin|signin/i.test(text)) return say('השרת של קל גן דורש התחברות לגוגל יש לפרסם את האפליקציה עם גישה לכל אחד');
    if (/^\s*\{/.test(text)) return say('השרת של קל גן עונה בגרסה ישנה יש לפרסם גרסה חדשה');
    if (/<html|<!doctype/i.test(text)) return say('השרת של קל גן החזיר דף אינטרנט במקום תשובה יש לפרסם גרסה חדשה של הקוד');
    return say('התקבלה תשובה לא מוכרת מהשרת של קל גן');
  }
};
