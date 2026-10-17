import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const folder=process.env.EVENTIDE_SMOKE_ARTIFACTS ?? 'artifacts/deployment/local';mkdirSync(folder,{recursive:true});
test('bản build đúng /EVENTIDE/, font/ảnh local, không hook test, chơi tiếp khi offline', async ({ page, context, baseURL }) => {
  const errors: string[] = [], remote: string[] = [];
  const target=new URL(baseURL!), requests:string[]=[];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { const url = new URL(r.url());if (!['http:','https:'].includes(url.protocol)) return;requests.push(url.href); if (url.origin !== target.origin || !url.pathname.startsWith(target.pathname)) remote.push(r.url()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto('./?e2e=1&perf=1'); await expect(page.getByRole('button', { name: 'Khởi hành' })).toBeVisible();
  await expect(page.locator('.footer')).toContainText('beta 1.0.0');
  expect(await page.evaluate(()=>document.fonts.check('600 16px "Eventide Sans"')&&document.fonts.check('400 24px "Eventide Serif"'))).toBe(true);
  expect(await page.locator('img').evaluateAll(images=>images.every(img=>img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0))).toBe(true);
  await page.screenshot({path:`${folder}/menu.png`});
  await page.reload();await expect(page.locator('[data-action=start]')).toBeVisible();
  expect(await page.evaluate(() => '__eventide' in window)).toBe(false);
  expect(await page.evaluate(() => '__eventidePerf' in window)).toBe(false);
  await context.setOffline(true); await page.getByRole('button', { name: 'Khởi hành' }).click();
  await expect(page.locator('#ship-hp')).toContainText('100/100');
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Tiếp tục' })).toBeVisible();
  expect(errors).toEqual([]); expect(remote).toEqual([]);
  writeFileSync(`${folder}/network.json`,JSON.stringify({url:baseURL,requests,errors,unexpected:remote},null,2));
});
test('production: di chuyển, nhặt XP/chọn cấp thật, B/pause, bắn/audio và save qua refresh',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  // Probe chỉ ở browser automation: quan sát WebAudio thật, không thêm hook/cheat vào production bundle.
  await page.addInitScript(()=>{
    const Original=window.AudioContext;const probe:{contexts:AudioContext[];frequencies:number[]}={contexts:[],frequencies:[]};
    Object.assign(window,{__audioProbe:probe});
    window.AudioContext=class extends Original {
      constructor(options?:AudioContextOptions){super(options);probe.contexts.push(this);}
      createOscillator():OscillatorNode{const oscillator=super.createOscillator(),set=oscillator.frequency.setValueAtTime.bind(oscillator.frequency);oscillator.frequency.setValueAtTime=(value,time)=>{probe.frequencies.push(value);return set(value,time);};return oscillator;}
    };
  });
  await page.goto('./');await page.locator('[data-action=start]').click();
  await page.keyboard.down('w');await page.waitForTimeout(550);await page.keyboard.up('w');
  await page.keyboard.down('d');await expect(page.locator('#direction')).toBeVisible({timeout:15000});
  await expect(page.locator('.upgrade-panel')).toBeVisible({timeout:15000});await page.keyboard.up('d');
  const choice=await page.locator('[data-upgrade]').first().getAttribute('data-upgrade');await page.waitForTimeout(220);await page.locator('[data-upgrade]').first().click();
  await page.keyboard.press('b');await expect(page.locator('.read-content')).toContainText('1 lựa chọn đã nhận');await expect(page.locator('.read-content')).toContainText('Cấp 2');
  await page.screenshot({path:`${folder}/natural-level-build.png`});await page.keyboard.press('b');
  await page.keyboard.down('a');await expect(page.locator('#direction')).toBeHidden({timeout:10000});await page.keyboard.up('a');
  await expect.poll(()=>page.evaluate(()=>Reflect.get(window,'__audioProbe').frequencies.includes(420)),{timeout:20000}).toBe(true);
  await page.keyboard.press('Escape');const time=await page.locator('#modal-title').textContent();await page.waitForTimeout(250);expect(await page.locator('#modal-title').textContent()).toBe(time);
  await page.locator('[data-action=resume]').click();await expect(page.locator('#beacon-hp')).toBeVisible();
  await page.locator('[data-action=mute]').click();await expect(page.locator('#mute-button')).toContainText('Tắt');
  const audio=await page.evaluate(()=>{const p=Reflect.get(window,'__audioProbe') as {contexts:AudioContext[];frequencies:number[]};return{states:p.contexts.map(c=>c.state),frequencies:p.frequencies};});expect(audio.states).toContain('running');expect(audio.frequencies).toContain(420);
  await page.locator('[data-action=mute]').click();await expect(page.locator('#mute-button')).toContainText('Bật');
  await page.keyboard.press('Escape');await page.locator('[data-action=menu]').click();await page.locator('[data-action=settings]').click();await page.locator('[data-setting=volume]').focus();await page.keyboard.press('Home');for(let i=0;i<11;i++)await page.keyboard.press('ArrowRight');
  await page.locator('[data-setting=muted]').check();const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('eventide.save.v1')!));await page.reload();await page.locator('[data-action=settings]').click();await expect(page.locator('[data-setting=muted]')).toBeChecked();await expect(page.locator('[data-setting=volume]')).toHaveValue('0.55');
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('eventide.save.v1')!));expect(after).toEqual(before);expect(errors).toEqual([]);
  writeFileSync(`${folder}/gameplay.json`,JSON.stringify({url:page.url(),choice,audio,save:after,errors,naturalUpgrade:true},null,2));
});
