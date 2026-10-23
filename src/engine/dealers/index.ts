import type { HandType, Suit } from '../types';

export interface DealerDialogue {
  intro: string;
  curse: string;
  bigScore: string;
  playerWin: string;
  playerLose: string;
}

export interface DealerDef {
  floor: number;
  id: string;
  name: string;
  title: string;
  emoji: string;
  curseName: string;
  curseDescription: string;
  dialogue: DealerDialogue;
  /** Floor 4: Iron Golem reduces hand size by 1 */
  handSizeDelta?: number;
  /** Floor 2: Crimson Baron drains $1 per discard */
  discardCost?: number;
  /** Floor 1: Madame Moth disables a suit after hand 2 */
  disabledSuitAfterHand2?: Suit;
  /** Floor 3: Mist Sisters flip 1 card face-down after hand 1 */
  flipCardAfterHand1?: boolean;
  /** Floor 5: Victor shuffles charms after every hand */
  shuffleCharmsEachHand?: boolean;
  /** Floor 6: Selene bans a poker hand type */
  bannedHand?: HandType;
  /** Floor 7: Skeleton King seals leftmost charm after hand 2 */
  sealLeftCharmAfterHand2?: boolean;
  /** Floor 8: The House bans repeating previously played hand types + has Phase 2 (+50% target) */
  noRepeatHandsAndTwoPhase?: boolean;
}

export const DEALERS: DealerDef[] = [
  {
    floor: 1,
    id: 'madame-moth',
    name: 'มาดามโมธ',
    title: 'แม่มดแมลงเม่า',
    emoji: '🦋',
    curseName: 'ผงปีกมอดไหม้',
    curseDescription: 'หลังเล่นครบ 2 มือ: ไพ่ ♥ ทั้งหมดจะไม่ถูกนับแต้ม',
    disabledSuitAfterHand2: 'hearts',
    dialogue: {
      intro: 'คิกๆ ยินดีต้อนรับสู่ชั้นแรกจ้ะพ่อหนุ่ม ระวังหัวใจจะโดนแมลงเม่าแทะนะ!',
      curse: 'ฮิๆ ครบสองมือแล้ว! ผงปีกของฉันจะทำให้ไพ่ ♥ ของเธอดับแสง!',
      bigScore: 'ว้าย! แสงสว่างจ้าแสบตาไปหมดแล้ว!',
      playerWin: 'โธ่เอ๊ย ปีกฉันไหม้หมดแล้ว... เชิญขึ้นชั้นต่อไปเถอะจ้ะ!',
      playerLose: 'คิกๆ วิญญาณของเธอหวานอร่อยเหมือนน้ำหวานดอกไม้เลย!',
    },
  },
  {
    floor: 2,
    id: 'baron-crimson',
    name: 'บารอนกริมสัน',
    title: 'ขุนนางแวมไพร์',
    emoji: '🧛',
    curseName: 'ภาษีโลหิต',
    curseDescription: 'ทุกครั้งที่กด Discard จะถูกสูบเงิน $1 (ถ้าไม่มีเงินจะเสียเปล่า)',
    discardCost: 1,
    dialogue: {
      intro: 'สายัณห์สวัสดิ์... ที่โต๊ะของข้า ทุกการทิ้งไพ่มีราคาที่ต้องจ่ายเป็นทองคำ',
      curse: 'กลิ่นเหรียญทองช่างหอมหวาน... ขอบคุณสำหรับเครื่องบรรณาการ',
      bigScore: 'น่าประทับใจ... เลือดในกายเจ้าคงร้อนแรงไม่เบา',
      playerWin: 'ยอมรับในฝีมือ... เชิญผ่านไปได้ ก่อนที่ข้าจะเปลี่ยนใจ',
      playerLose: 'หมดตัวแล้วรึ? เช่นนั้นก็จงจ่ายด้วยโลหิตของเจ้าแทนเถิด!',
    },
  },
  {
    floor: 3,
    id: 'mist-sisters',
    name: 'สามพี่น้องหมอก',
    title: 'ภูตหมอกลวงตา',
    emoji: '🌫️',
    curseName: 'หมอกบังตา',
    curseDescription: 'หลังเล่นมือแรก: ทุกตาจะมีไพ่ในมือ 1 ใบถูกพลิกคว่ำมองไม่เห็นหน้าไพ่',
    flipCardAfterHand1: true,
    dialogue: {
      intro: 'เห็นไหม? / ไม่เห็นหรอก! / หมอกลงหนาขนาดนี้ จะจั่วได้อะไรกันนะ~',
      curse: 'หมอกลงแล้วจ้ะ~ ลองเดาดูสิว่าไพ่ที่คว่ำอยู่คือใบอะไร!',
      bigScore: 'โอ๊ะ! มองทะลุหมอกของพวกเราได้ยังไงกัน!',
      playerWin: 'หมอกจางเสียแล้ว... พวกเรายอมแพ้จ้ะ~',
      playerLose: 'หลงทางในสายหมอกตลอดกาลเถอะนะ~',
    },
  },
  {
    floor: 4,
    id: 'iron-golem',
    name: 'ท่านโกเลมเหล็ก',
    title: 'ผู้คุมกฎศิลาเหล็ก',
    emoji: '🗿',
    curseName: 'ตรวนเหล็กถ่วงมือ',
    curseDescription: 'ขนาดมือลดลง 1 ใบตลอดทั้งโต๊ะ (จั่วขึ้นมือได้สูงสุด 7 ใบ)',
    handSizeDelta: -1,
    dialogue: {
      intro: 'กฎ... คือ... เหล็ก... จงเล่นด้วยไพ่เพียงเจ็ดใบ',
      curse: 'น้ำหนักของตรวนเหล็ก... จะบดขยี้ทางเลือกของเจ้า',
      bigScore: 'แรงกระแทกสูง... เกราะร้าว...',
      playerWin: 'ระบบ... หยุดทำงาน... อนุญาตให้ผ่าน...',
      playerLose: 'บดขยี้... เสร็จสมบูรณ์',
    },
  },
  {
    floor: 5,
    id: 'victor-illusionist',
    name: 'จอมกลวิกเตอร์',
    title: 'นักมายากลลวงโลก',
    emoji: '🎩',
    curseName: 'สลับกลลวงตา',
    curseDescription: 'หลังเล่นทุกมือ ตำแหน่งเครื่องรางทั้งหมดจะถูกสลับแบบสุ่ม',
    shuffleCharmsEachHand: true,
    dialogue: {
      intro: 'เลดี้แอนด์เจนเทิลแมน! จับตาดูเครื่องรางของคุณให้ดี เพราะพริบตาเดียวมันจะย้ายที่!',
      curse: 'อาบราคาดาบรา! เครื่องรางสลับตำแหน่ง! อย่าลืมเรียงใหม่ล่ะ ฮ่าๆ!',
      bigScore: 'โอ้โห! นั่นมันมายากลบทไหนกันเนี่ย!',
      playerWin: 'แปะๆๆ! ขอปรบมือให้ผู้ชมผู้ทรงเกียรติ เชิญขึ้นชั้นต่อไปครับ!',
      playerLose: 'และแล้วแต้มของคุณก็... หายวับไปกับตา! ขอบคุณที่รับชมครับ!',
    },
  },
  {
    floor: 6,
    id: 'selene-oracle',
    name: 'หมอดูเซเลน',
    title: 'พยากรณ์แห่งดวงดาว',
    emoji: '🔮',
    curseName: 'คำพยากรณ์ต้องห้าม',
    curseDescription: 'ห้ามเล่นมือ "Pair" — หากฝืนเล่นจะได้ 0 แต้มทันที',
    bannedHand: 'Pair',
    dialogue: {
      intro: 'ดวงดาวบอกฉันล่วงหน้าแล้ว... ว่าวันนี้ "ไพ่คู่ (Pair)" จะนำหายนะมาสู่เจ้า',
      curse: 'ฉันเตือนเจ้าแล้ว! ชะตากรรมไม่อนุญาตให้ไพ่คู่นี้เกิดผล!',
      bigScore: 'ดวงดาวสั่นสะเทือน... นี่ไม่อยู่ในคำทำนายของฉัน!',
      playerWin: 'เจ้าฝืนลิขิตฟ้าได้จริงๆ... เชิญก้าวต่อไปเถิด',
      playerLose: 'ทุกอย่างเป็นไปตามที่ลูกแก้วพยากรณ์ไว้ไม่มีผิดเพี้ยน',
    },
  },
  {
    floor: 7,
    id: 'skeleton-king',
    name: 'ราชาโครงกระดูก',
    title: 'กษัตริย์ผู้วายชนม์',
    emoji: '💀',
    curseName: 'ตราผนึกราชันย์',
    curseDescription: 'หลังเล่นครบ 2 มือ: เครื่องรางช่องซ้ายสุดจะถูกปิดผนึก ไม่แสดงผล',
    sealLeftCharmAfterHand2: true,
    dialogue: {
      intro: 'คุกเข่าลงเสีย! ต่อหน้าบัลลังก์กระดูก เครื่องรางของเจ้าก็เป็นเพียงของเล่น!',
      curse: 'ด้วยอำนาจแห่งข้า ขอผนึกเครื่องรางชิ้นแรกของเจ้าไว้ในความมืด!',
      bigScore: 'หนอยแน่! เจ้าบังอาจสั่นคลอนบัลลังก์ของข้า!',
      playerWin: 'แม้แต่ความตายก็หยุดเจ้าไม่ได้รึ... ไปหาเดอะเฮาส์ที่ชั้นบนสุดซะ!',
      playerLose: 'จงกลายเป็นโครงกระดูกเฝ้าท้องพระโรงของข้าชั่วนิรันดร์!',
    },
  },
  {
    floor: 8,
    id: 'the-house',
    name: 'เดอะเฮาส์',
    title: 'จอมเวทเจ้าของบ่อน',
    emoji: '👁️',
    curseName: 'กฎเหล็กของเจ้ามือ',
    curseDescription: 'ห้ามเล่นชนิดมือโป๊กเกอร์ซ้ำกับที่เคยเล่นไปแล้วในโต๊ะนี้ และมีร่างที่ 2 (+50% เป้าหมาย)',
    noRepeatHandsAndTwoPhase: true,
    dialogue: {
      intro: 'ยินดีต้อนรับสู่ชั้นสูงสุด ข้าคือเจ้าของบ่อนแห่งนี้... จงแสดงทุกหน้าไพ่ที่เจ้ามี بدونการซ้ำเดิม',
      curse: 'ในบ่อนของข้า ความจำเจคือความตาย! และนี่คือบททดสอบที่แท้จริงของข้า!',
      bigScore: 'ฮึ... สมแล้วที่ไต่ขึ้นมาถึงชั้นแปดได้',
      playerWin: 'เป็นไปไม่ได้... เจ้าล้มบ่อนของข้าได้! บ่อนเวทมนตร์แห่งนี้เป็นของเจ้าแล้ว!',
      playerLose: 'จำไว้เสมอ... ท้ายที่สุดแล้ว "เจ้ามือย่อมชนะเสมอ"',
    },
  },
];

export function getDealerForFloor(floor: number): DealerDef {
  return DEALERS[(floor - 1) % DEALERS.length];
}

