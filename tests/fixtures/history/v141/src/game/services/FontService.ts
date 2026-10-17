/** Chuỗi bao phủ chữ Việt dùng để tải đúng glyph/weight trước Canvas text quan trọng. */
export const VIETNAMESE_SAMPLE = 'EVENTIDE — Thủy Triều Hư Không\nGiữ lấy khoảnh khắc.\nKhi mọi ngôi sao đã tắt, hãy là ánh sáng cuối cùng.\nTàn Tích Ngân Hà\nHướng dẫn · Cài đặt · Tiếp tục · Chơi lại · Về menu\nMáu tối đa · Phạm vi thu thập · Stardust tinh khiết\nĂ Â Ê Ô Ơ Ư Đ ă â ê ô ơ ư đ\nẮ Ằ Ẳ Ẵ Ặ ấ ầ ẩ ẫ ậ ế ề ể ễ ệ ố ồ ổ ỗ ộ\nớ ờ ở ỡ ợ ứ ừ ử ữ ự ỳ ý ỷ ỹ ỵ';
export const normalizeText = (text: string): string => text.normalize('NFC');
export const TEXT_FONTS = { body: '"Eventide Sans", Arial, sans-serif', title: '"Eventide Serif", Georgia, serif' } as const;
/** Không treo boot nếu font lỗi. DOM swap tự vẽ lại; hiện game không dùng Phaser Text. */
export async function loadFonts(timeoutMs = 2500): Promise<'loaded' | 'fallback'> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const fonts = Promise.all(['400 16px "Eventide Sans"', '600 16px "Eventide Sans"', '400 24px "Eventide Serif"', '500 24px "Eventide Serif"'].map(face => document.fonts.load(face, VIETNAMESE_SAMPLE)));
    void fonts.then(faces => { if (faces.every(f => f.length)) document.documentElement.dataset.fontStatus = 'loaded'; }).catch(() => {});
    return await Promise.race([fonts.then(faces => faces.every(f => f.length) ? 'loaded' as const : 'fallback' as const), new Promise<'fallback'>(resolve => { timer = setTimeout(() => resolve('fallback'), timeoutMs); })]);
  } catch { return 'fallback'; } finally { if (timer) clearTimeout(timer); }
}
/** Factory cho Canvas Text mới/QA: cùng face với DOM, có padding cho dấu trên/dưới. */
export const canvasTextStyle = (title = false) => ({ fontFamily: title ? TEXT_FONTS.title : TEXT_FONTS.body, fontSize: title ? '24px' : '16px', color: '#edf3ef', padding: { left: 4, right: 4, top: 8, bottom: 8 }, lineSpacing: 8 });
