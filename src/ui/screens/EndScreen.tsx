interface Props {
  victory: boolean;
  floor: number;
  onRestart: () => void;
}

export function EndScreen({ victory, floor, onRestart }: Props) {
  return (
    <div className="screen center-screen">
      <div className="modal">
        <h2>{victory ? '🏆 คุณเอาชนะเจ้าของบ่อนได้!' : '💀 เกมจบ'}</h2>
        <p>{victory ? 'ผ่านครบทั้ง 8 ชั้น' : `แพ้ที่ชั้น ${floor}`}</p>
        <button className="btn play" onClick={onRestart}>เริ่มรอบใหม่</button>
      </div>
    </div>
  );
}

