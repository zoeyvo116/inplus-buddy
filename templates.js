// =============================================================
//  templates.js — Inplus Support Tool
//  Toàn bộ nội dung template và câu trả lời ở đây.
//  Muốn sửa câu, chỉ cần chỉnh file này, không cần động vào code logic.
// =============================================================

// ───────────────────────────────────────────────────────────
// JST DATETIME HELPER
// ───────────────────────────────────────────────────────────
function getJstDatetime() {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('ja-JP', {
      timeZone:'Asia/Tokyo', year:'numeric', month:'numeric', day:'numeric',
      hour:'2-digit', minute:'2-digit', hour12:false
    }).formatToParts(now);
    const p = {};
    parts.forEach(({type,value}) => p[type]=value);
    return `${p.year}年${p.month}月${p.day}日 ${p.hour}:${p.minute}`;
  } catch(e) {
    const d = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Tokyo'}));
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
}

// ───────────────────────────────────────────────────────────
// PHẦN 1: HÀM CHUNG (base, footer, q...)
// Sửa nội dung câu mở đầu / kết thúc theo kênh tại đây
// ───────────────────────────────────────────────────────────

function base(){
  const ch=S.ch;
  if(ch==='LINE')    return `ご連絡頂きありがとうございます。`;
  if(ch==='Amazon')  return `この度は Amazon にてJAPAN & GLOBAL eSIM をご購入いただき、誠にありがとうございます。\nイン・プラスサポートセンターと申します。\n\n以下内容の件、ご返答させて頂きたく思っております。`;
  if(ch==='Yahoo')   return `この度はお問い合わせいただき、誠にありがとうございます。\nイン・プラスサポートセンターと申します。\n\n以下内容の件、ご返答させて頂きたく思っております。`;
  // Website / メール
  return `この度はお問い合わせいただき、誠にありがとうございます。\nイン・プラスサポートセンターと申します。\n\n以下内容の件、ご返答させて頂きたく思っております。`;
}

function namePrefix(d){
  if((S.ch==='Yahoo'||S.ch==='メール')&&d.name) return `${d.name}様\n\n`;
  return '';
}

function statusBlock(d){
  if(!d.genjou) return '';
  return `\n\n＜現状＞\n${d.genjou}`;
}

function q(d,ans){
  if(S.ch==='LINE') return `\n\n${ans}`;
  return d.quote?`\n＞${d.quote}\n→${ans}`:`\n\n${ans}`;
}

function assembleTmpl(...parts){return parts.join('').replace(/^\n+/,'');}

function footer(){
  const ch=S.ch;
  if(ch==='LINE') return `\n\n今後ともどうぞよろしくお願いいたします。`;
  return `\n\n今後ともどうぞよろしくお願いいたします。\nイン・プラスサポートセンター`;
}


// ───────────────────────────────────────────────────────────
// PHẦN 2: TEMPLATE THÔNG THƯỜNG (T object)
// Các case không phải 設定トラブル — sửa nội dung câu trả lời tại đây
// ───────────────────────────────────────────────────────────

const T={

  // ── 配送・配信 ──

  delivery_not_arrived:(d)=>{
    if(S.ch==='LINE'){
      if(S.deliveryLineStep===1){
        return `お問い合わせいただきありがとうございます。\nご注文番号をご共有いただけますでしょうか。\n確認後、配送状況をご案内いたします。${footer()}`;
      }
      return ''; // step2 is staff-side warning only
    }
    const orderNo = document.getElementById('d-order-no')?.value.trim()||'〇〇〇〇〇';
    const shipDate= document.getElementById('d-ship-date')?.value.trim()||'〇〇年〇月〇日';
    const trackNo = document.getElementById('d-tracking-no')?.value.trim()||'〇〇〇〇-〇〇〇〇-〇〇〇〇';
    const body=
      `ご注文の商品につきまして、配送状況を確認いたしました。\n\n`+
      `＜配送情報＞\n`+
      `注文番号：${orderNo}\n`+
      `発送日：${shipDate}\n`+
      `追跡番号：${trackNo}\n`+
      `配送会社：日本郵便\n\n`+
      `追跡番号より現在の配送状況をご確認いただけます。\n`+
      `https://trackings.post.japanpost.jp/\n\n`+
      `お届けまでいましばらくお待ちいただけますでしょうか。\n`+
      `一定期間経過後もお届けがない場合は、再度ご連絡いただけますでしょうか。`;
    return `${namePrefix(d)}${base()}${q(d,body)}${footer()}`;
  },

  delivery_no_email:(d)=>{
    if(S.ch==='LINE'){
      if(S.deliveryLineStep===1){
        return `お問い合わせいただきありがとうございます。\nご注文番号をご共有いただけますでしょうか。\n確認後、メールの配信状況をご案内いたします。${footer()}`;
      }
      return '';
    }
    const status=S.deliveryEmailStatus;
    if(!status) return '（メール状態を選択してください）';
    if(status==='unsent'){
      const orderTime= document.getElementById('d-order-time')?.value.trim()||'〇〇:〇〇';
      const schedTime= document.getElementById('d-scheduled-time')?.value.trim()||'〇〇:〇〇前後';
      const body=
        `弊社の配信スケジュールは以下の通りとなっております。\n\n`+
        `・15時までのご購入　→　18時前後に配信\n`+
        `・16時以降のご購入　→　翌営業日11時前後に配信\n\n`+
        `ご購入時間を確認いたしましたところ「${orderTime} JST」となっておりましたため、\n`+
        `${schedTime}頃に順次配信いたします。今しばらくお待ちくださいませ。`;
      return `${namePrefix(d)}${base()}${q(d,body)}${footer()}`;
    }
    // sent
    const sentTime= document.getElementById('d-sent-time')?.value.trim()||'〇〇年〇月〇日 〇〇:〇〇';
    const body=
      `eSIMのご案内につきましては、${sentTime}に送信済みでございます。\n\n`+
      `また、先ほどご登録のメールアドレス宛にも再送させていただきました。\n\n`+
      `お手数ですが、受信ボックスおよび迷惑メールフォルダもあわせてご確認いただけますようお願いいたします。\n\n`+
      `万が一ご確認できない場合は、別のメールアドレスへの再送も可能ですので、お気軽にお知らせください。`;
    return `${namePrefix(d)}${base()}${q(d,body)}${footer()}`;
  },

  delivery_redeem_code:(d)=>{
    const body=
      `引換コードのご利用手順は以下の通りです。\n\n`+
      `【STEP 1】受信\n`+
      `弊社よりお送りした引換コードと専用サイトURLをご確認ください。\n\n`+
      `【STEP 2】発行\n`+
      `以下の専用サイトにアクセスし、引換コード（半角英数字21桁）を入力して「引き換え」をタップしてください。\n`+
      `https://redeem.tsimtech.com/RedeemEsimCode/inplus/identify/jp\n`+
      `→ QRコードとアクティベーションコードが表示されます。\n\n`+
      `【STEP 3】設定\n`+
      `■ スマホ2台をお持ちの場合\n`+
      `別の端末でQRコードをスキャンしてください。\n\n`+
      `■ スマホ1台の場合\n`+
      `画面に表示されたアクティベーションコードをコピーして、設定画面に貼り付けてください。\n\n`+
      `設定完了後、現地到着時にデータローミングをONにしてご利用開始いただけます。`;
    return `${namePrefix(d)}${base()}${q(d,body)}${footer()}`;
  },

  delivery_amazon:(d)=>`${namePrefix(d)}${base()}${q(d,
    `eSIMの受け取りにご不便をおかけしてしまい、大変申し訳ございません。\n\n`+
    `引き換えコードは下記の通り、Amazonメッセージセンターより配信済みでございます。\n\n`+
    `◆ 配信日時：${d.note||'〇〇年〇月〇日 〇〇:〇〇（日本時間）'}\n\n`+
    `※引き換えコードはAmazonメッセージセンターよりお送りしておりますので、そちらよりご確認くださいませ。`
  )}${footer()}`,

  exchange_code_cvs:(d)=>`${namePrefix(d)}${base()}${q(d,
    `引換コードは、下記のURLよりお客様ご自身でQRコードへ引き換えていただけます。\n\n`+
    `https://redeem.tsimtech.com/RedeemEsimCode/inplus/identify/jp\n\n`+
    `・引換コード自体には有効期限はございません。\n`+
    `・QRコードを発行すると、有効期限は発行日から30日間となります。`
  )}${footer()}`,

  cancel_ok_web:(d)=>`${namePrefix(d)}${base()}${q(d,
    `お客様のご利用状況を確認いたしましたところ、まだ「未使用」の状態でしたので、今回に限り返金対応をさせていただきます。\n\n`+
    `ご迷惑をおかけいたしました。またのご利用を心よりお待ちしております。`
  )}${footer()}`,

  cancel_ng_used:(d)=>`${namePrefix(d)}${base()}${q(d,
    `誠に恐れ入りますが、eSIMは一度ダウンロード・インストールが完了した場合、通信商品の性質上、ご返金・キャンセルはお受けできかねますので、あらかじめご了承くださいませ。`
  )}${footer()}`,

  cancel_difficult:(d)=>`${namePrefix(d)}${base()}${q(d,
    `誠に恐れ入りますが、eSIMは一度QRコードをお読み取りいただいた後は、設定が完了できない場合でも、通信商品の性質上、ご返金・キャンセルはお受けできかねますので、あらかじめご了承くださいませ。\n\n`+
    `eSIMの設定につきましては、引き続きサポートいたします。`
  )}${footer()}`,

  connect_trouble:(d)=>{
    const apn=d.apn||'cmhk';
    if(d.sig==='ng'||checks.signal==='ng'){
      return `${namePrefix(d)}${base()}${statusBlock(d)}${q(d,
        `以下の順番でご確認いただけますでしょうか。\n\n`+
        `1. 「このeSIMを使用する」がONになっているか確認\n`+
        `2. データローミングをONにする\n`+
        `3. ネットワークを手動選択：KDDI または Softbank\n`+
        `4. 機内モードをON→OFFで再接続\n`+
        `5. SIMロックが解除されているか確認\n\n`+
        `改善が見られない場合は、以下のスクリーンショットをお送りください。\n\n`+
        `1. ネットワーク設定\n2. SIMカード設定\n3. データローミング設定\n4. APN設定`
      )}${footer()}`;
    }
    return `${namePrefix(d)}${base()}${statusBlock(d)}${q(d,
      `以下の順番でご確認いただけますでしょうか。\n\n`+
      `1. データローミングがONになっているか確認\n`+
      `2. APN設定を確認：「${apn}」に設定されているか\n`+
      `3. 構成プロファイルを削除（iPhone）：設定 → 一般 → VPNとデバイス管理\n`+
      `4. VPNを無効化\n`+
      `5. 端末を再起動\n\n`+
      `改善が見られない場合は、以下のスクリーンショットをお送りください。\n\n`+
      `1. ネットワーク設定\n2. SIMカード設定\n3. データローミング設定\n4. APN設定`
    )}${footer()}`;
  },

  qr_cannot_read:(d)=>`${namePrefix(d)}${base()}${statusBlock(d)}${q(d,
    `eSIMはすでにお客様の端末にインストールされております。\n\n`+
    `QRコードはセキュリティ上の理由により、一度インストールされると再利用できない仕様となっております。\n\n`+
    `端末設定から「このeSIMを使用する」をタップしていただき、有効化していただけます。\n\n`+
    `その後、データローミングをONにしていただくことでご利用開始いただけます。\n\n`+
    `弊社サービスは1）現地到着で現地電波取得 2）ローミングONで利用開始となりますので、日本でダウンロード頂いて問題ございません。`
  )}${footer()}`,

  sim_lock:(d)=>`${namePrefix(d)}${base()}${q(d,
    `弊社のeSIMをご利用いただくには、端末のSIMロック解除が必要でございます。\n\n`+
    `SIMロック解除は、端末をご購入されたキャリア（docomo・au・Softbankなど）へお問い合わせいただくか、各キャリアのウェブサイトよりお手続きください。`
  )}${footer()}`,

  esim_deleted:(d)=>`${namePrefix(d)}${base()}${q(d,
    `誠に恐れ入りますが、一度削除されたeSIMは再インストールができかねます。\n\n`+
    `ご利用状況を確認いたしますので、ご注文番号またはICCIDをお知らせいただけますでしょうか。`
  )}${footer()}`,

  config_profile:(d)=>`${namePrefix(d)}${base()}${q(d,
    `構成プロファイルの確認・削除方法をご案内いたします。\n\n`+
    `【iPhoneの場合】\n「設定」→「一般」→「VPNとデバイス管理」→ 構成プロファイルが表示されていないかご確認ください。\n\n`+
    `インストールされている場合は削除してから、再度通信をお試しください。`
  )}${footer()}`,

  apn_setting:(d)=>`${namePrefix(d)}${base()}${q(d,
    `APN設定方法をご案内いたします。${d.apn?'\n\n正しいAPN：【'+d.apn+'】':''}\n\n`+
    `■ iPhoneの場合\n設定 → モバイル通信 → モバイルデータ通信ネットワーク →\nAPN欄に「${d.apn||'cmhk'}」と入力してください。\n\n`+
    `■ Androidの場合\n設定 → ネットワークとインターネット → モバイルネットワーク → APN →\n「＋」を選択し、APN欄に「${d.apn||'cmhk'}」を入力後、保存してください。`
  )}${footer()}`,

  start_date:(d)=>{
    const sc=S.startDateScenario;
    const ch=S.ch;
    // ① 普通の質問
    if(!sc||sc==='①'){
      return `${namePrefix(d)}${base()}${q(d,
        `本件につきましては「アクティベートされた日」からのカウントとなります。\n\n`+
        `現地到着後、「ローミングON」にして電波を拾った段階でご利用開始となります。\n\n`+
        `※アクティベートされた日とは：\n`+
        `１）対応端末にeSIMのダウンロードが完了\n`+
        `２）端末およびeSIMの「ローミングON」に設定完了\n`+
        `３）ご購入プランの通信対応地域にいる\n\n`+
        `上記１）２）３）が完了した段階を指します。\n`+
        `そのため、現地到着前にローミングをONにされても、日数のカウントは開始されませんのでご安心ください。`
      )}${footer()}`;
    }
    // ② 心配している / ローミング済み
    // ②-a: ICCIDなし
    if(S.startDateIccid!=='yes'){
      // LINE only: generate ICCID request template
      if(ch==='LINE'){
        const ask=
          `ご連絡いただきありがとうございます。\n`+
          `通常、渡航先に到着しローミングを「ON」にした時点でご利用日数のカウントが開始される仕組みとなっております。\n\n`+
          `より正確にご状況を確認するため、eSIMのICCID番号をご共有いただけますでしょうか。`;
        return `${namePrefix(d)}${ask}${footer()}`;
      }
      return ''; // 非LINE: note shown in UI, no template
    }
    // ②-b: ICCIDあり
    const isLine=ch==='LINE';
    // LINE: 未使用をchipで確認
    if(isLine){
      if(!S.startDateUnused) return '';
      if(S.startDateUnused==='no') return '';
      // 未使用確認済み → LINEテンプレ生成
    } else {
      // 非LINE: B2B貼り付けて未使用チェック (rawB2bで確認)
      const rawB2b=document.getElementById('f-genjou')?.value||'';
      if(!rawB2b.trim()) return '';
      const rawForCheck=S.startDateRawB2b||rawB2b;
      const isUnused=rawForCheck.includes('未使用');
      const warn=document.getElementById('sd-warn-no-unused');
      if(!isUnused){ if(warn) warn.style.display='block'; return ''; }
      if(warn) warn.style.display='none';
    }
    if(ch==='LINE'){
      const lineBody=
        `注文番号ご提供いただきありがとうございます。\n\n`+
        `通常、現地に到着し、ローミングを「ON」にした時点でご利用日数のカウントが開始される仕組みとなっております。`+
        `一度オンにされていても、現地の電波を受信していなければ、利用期間はカウントされておりません。\n\n`+
        `システムにて確認いたしましたところ、お客様のeSIMは現在も「未使用」の状態となっておりますため、`+
        `現在オフにしていただいていれば問題ございません。ご安心くださいませ。\n\n`+
        `現地へご到着後、改めてeSIMとデータローミングをオンにしていただくことで、その時点より利用が開始されます。`;
      return lineBody+footer();
    }
    // Amazon / Yahoo / メール
    const rawB2b=document.getElementById('f-genjou')?.value||'';
    const p=parseB2B(S.startDateRawB2b||rawB2b);
    const statusLines=[];
    if(p.plan)        statusLines.push(`プラン：${p.plan}`);
    if(p.systemIccid) statusLines.push(`購入時のICCID：${p.systemIccid}`);
    if(p.deviceIccid) statusLines.push(`デバイスに表示したICCID：${p.deviceIccid}`);
    if(!p.systemIccid && !p.deviceIccid && p.iccid) statusLines.push(`ICCID：${p.iccid}`);
    statusLines.push(`現在の状態：未使用`);
    const ansBody=
      `お客様の状況を確認いたしました。\n\n＜確認内容＞\n${statusLines.join('\n')}\n\n`+
      `本件につきましては「アクティベートされた日」からのカウントとなります。\n`+
      `現地到着後、「ローミングON」にして電波を拾った段階でご利用開始となります。\n\n`+
      `※アクティベートされた日とは：\n`+
      `１）対応端末にeSIMのダウンロードが完了\n`+
      `２）端末およびeSIMの「ローミングON」に設定完了\n`+
      `３）ご購入プランの通信対応地域にいる\n\n`+
      `上記１）２）３）が完了した段階を指します。\n`+
      `そのため、現地到着前にローミングをONにされても、日数のカウントは開始されませんのでご安心ください。\n\n`+
      `システムにて確認いたしましたところ、お客様のeSIMは現在も「未使用」の状態となっておりますため、`+
      `現在オフにしていただいていれば問題ございません。ご安心くださいませ。\n\n`+
      `念のため、ご出発まではデータローミングを「OFF」にしていただき、現地に到着されましたら「ON」に切り替えてご利用開始いただけますでしょうか。`;
    return `${namePrefix(d)}${base()}${q(d,ansBody)}${footer()}`;
  },

  roaming_japan:(d)=>`${namePrefix(d)}${base()}${q(d,
    `ご安心ください。\n\n`+
    `弊社のeSIMは、渡航先で電波を受信した時点からご利用開始となります。\n`+
    `日本国内でデータローミングをONにされても、現地到着前はプランの起算は始まりません。`
  )}${footer()}`,

  add_data:(d)=>{
    if(S.ch==='LINE') return (
      `ご連絡頂きありがとうございます。\n`+
      `大変申し訳ございませんが、現在データの追加購入（リチャージ）には対応しておりません。\n`+
      `データ容量が不足する場合は、新たにeSIMをご購入いただく必要がございます。`+
      footer()
    );
    return `${namePrefix(d)}${base()}${q(d,
      `現在、データの追加購入（リチャージ）には対応しておりません。\n\n`+
      `データ容量が不足する場合は、新たにeSIMをご購入いただく必要がございます。`
    )}${footer()}`;
  },

  voice_call:(d)=>{
    if(S.ch==='LINE') return (
      `ご連絡頂きありがとうございます。\n`+
      `弊社のeSIMはデータ通信専用のため、音声通話はご利用いただけません。\n`+
      `ただし、LINE・Skype・WhatsAppなどのアプリ通話はデータ通信でご利用可能です。`+
      footer()
    );
    return `${namePrefix(d)}${base()}${q(d,
      `弊社では2種類のeSIMをご提供しております。\n\n`+
      `【データ通信専用eSIM】\n`+
      `音声通話・SMSはご利用いただけません。\n`+
      `ただし、LINE・Skype・WhatsAppなどのアプリを通じた通話は、データ通信を利用してご利用いただけます。\n\n`+
      `【電話番号付きeSIM】\n`+
      `現地の電話番号が付与されており、音声通話・SMS・データ通信すべてご利用いただけます。\n\n`+
      `各商品はこちらからご確認いただけます：\nhttps://esim-globals.com/collections/all`
    )}${footer()}`;
  },

  iccid_how:(d)=>{
    if(S.ch==='LINE') return (
      `ご連絡頂きありがとうございます。\n`+
      `ICCIDの確認方法をご案内いたします。\n\n`+
      `【iPhoneの場合】\n設定 → 一般 → 情報 → ICCID\n\n`+
      `【Androidの場合】\n設定 → デバイス情報 → SIM情報\n\n`+
      `※購入後にお送りしたメール本文にも記載されております。`+
      footer()
    );
    return `${namePrefix(d)}${base()}${q(d,
      `ICCIDの確認方法をご案内いたします。\n\n`+
      `【iPhoneの場合】\n設定 → 一般 → 情報 → 下にスクロール →「ICCID」をご確認ください。\n\n`+
      `【Androidの場合】\n設定 → 端末情報 → SIM情報 →「ICCID」をご確認ください。\n\n`+
      `※ご購入後にお送りしたメール内にもICCIDが記載されております。`
    )}${footer()}`;
  },

  check_usage:(d)=>{
    if(S.ch==='LINE') return (
      `ご連絡頂きありがとうございます。\n`+
      `以下のリンクにICCIDを入力すると、現在のデータ残量をご確認いただけます。\n`+
      `https://search.t-sim.hk/dataplan/group/inplus`+
      footer()
    );
    return `${namePrefix(d)}${base()}${q(d,
      `データ残量は以下のリンクよりご確認いただけます：\nhttps://search.t-sim.hk/dataplan/group/inplus\n\n`+
      `ページ内にICCIDを入力していただくと、現在のデータ残量・利用状況をご確認いただけます。`
    )}${footer()}`;
  },

  auto_charge:(d)=>`${namePrefix(d)}${base()}${q(d,
    `弊社のeSIMは買い切り商品となっております。\n`+
    `自動チャージ・自動更新は一切ございませんのでご安心ください。\n\n`+
    `ご購入いただいたプランのみのお支払いとなります。`
  )}${footer()}`,

  device_check:(d)=>{
    if(S.ch==='LINE') return (
      `ご連絡頂きありがとうございます。\n`+
      `対応端末はこちらからご確認いただけます。\n`+
      `https://esim-globals.com/pages/esim-devices\n\n`+
      `設定の際は以下の点にご注意ください。\n`+
      `・Wi-Fi環境で設定してください\n`+
      `・QRコードは一度読み込むと再利用できません\n`+
      `・QRコードは購入後30日以内に設定が必要です`+
      footer()
    );
    return `${namePrefix(d)}${base()}${q(d,
      `ご利用可能な端末は以下のサイトよりご確認いただけます。\nhttps://esim-globals.com/pages/esim-devices\n\n`+
      `【設定時の注意点】\n`+
      `・Wi-Fi環境でご設定ください\n`+
      `・QRコードは一度読み込むと再利用できません\n`+
      `・QRコードは購入後30日以内に設定が必要です\n\n`+
      `設定方法：https://www.in-plus.co.jp/esim-install-jp/`
    )}${footer()}`;
  },

  qr_read_method:(d)=>{
    if(S.ch==='LINE') return (
      `ご連絡頂きありがとうございます。\n`+
      `1台のスマホでQRコードを読み取る方法をご案内いたします。\n\n`+
      `【iPhoneの場合】\n`+
      `メールでQRコードを表示 → 長押し → 「eSIMを追加」を選択\n\n`+
      `【Androidの場合】\n`+
      `QRコードが表示された画面をスクリーンショット → Googleレンズで読み取り`+
      footer()
    );
    return `${namePrefix(d)}${base()}${q(d,
      `1台のスマホでQRコードを読み取る方法をご案内いたします。\n\n`+
      `【iPhoneの場合】\n`+
      `Safariでメール画面を開き、QRコードを長押し → 「eSIMを追加」を選択\n\n`+
      `【Androidの場合】\n`+
      `A）QRコードが表示された画面をスクリーンショット → Googleレンズで読み取り\n`+
      `B）WebページのQRコードは画像を長押し → Googleレンズで読み取り`
    )}${footer()}`;
  },

  china_google:(d)=>{
    if(S.ch==='LINE') return (
      `ご連絡頂きありがとうございます。\n`+
      `中国（プレミアム）プランはシンガポールの回線を経由しているため、Google・TikTok・ChatGPTはすべてご利用いただけます。\n`+
      `また、iPhoneでもAndroidでも問題なくご利用いただけます。`+
      footer()
    );
    return `${namePrefix(d)}${base()}${q(d,
      `中国（プレミアム）プランはシンガポールの通信回線を経由しているため、\n`+
      `Google・TikTok・ChatGPTを含む各種サービスの制限はございません。\n\n`+
      `iPhoneおよびAndroid、どちらの端末でも問題なくご利用いただけます。`
    )}${footer()}`;
  },

  cancel_unused:(d)=>{
    const c=getCancelData();
    if(S.cancelQrStatus==='read'){
      return `${namePrefix(d)}${base()}${q(d,
        `誠に恐れ入りますが、引換コードがすでにご利用済みのため、\n`+
        `原則としてキャンセル・返金のご対応が難しい状況でございます。`
      )}${footer()}`;
    }
    if(!S.cancelQrStatus) return '';
    const refundBlock=
      `■ 返金資料\n`+
      (c.orderNo?`注文番号：${c.orderNo}\n`:'')+
      (c.plan?`注文内容：${c.plan}\n`:'')+
      (c.amount?`返金金額：${c.amount}\n`:'')+
      `\n・返金方法：ご購入時のお支払い方法にてご返金\n`+
      `・返金時期：お支払い方法により異なります\n\n`+
      `＜返金目安＞\n`+
      `・クレジットカード：7〜14営業日程度（カード会社により異なります）\n`+
      `・Shop Pay／Google Pay／PayPay：3〜5営業日程度\n`+
      `※上記は目安となり、決済会社により前後する場合がございます。`;
    const couponBlock=S.cancelCoupon&&c.couponCode?
      `\n\nまたご旅行の機会がございましたら、ぜひJAPAN & GLOBAL UNLIMITEDをご利用いただけますと幸いです。\n`+
      `お詫びといたしまして、次回ご利用いただけるクーポンをお送りいたします。\n\n`+
      `■ クーポンコード\nクーポンコード：${c.couponCode}（半角英字）\n`+
      `※全商品30％OFF\n※予告なく終了する場合がございますのでご了承ください`:'';
    const body=
      `eSIMがまだダウンロードされていない状態であることを確認いたしました。\n`+
      `キャンセル・返金の手続きを進めさせていただきます。\n\n`+
      refundBlock+couponBlock;
    return `${namePrefix(d)}${base()}${q(d,body)}${footer()}`;
  },

  cancel_unusable:(d)=>{
    if(!S.cancelUnused) return '';
    if(S.cancelUnused===false) return '';
    const c=getCancelData();
    const refundBlock=
      `■ 返金資料\n`+
      (c.orderNo?`注文番号：${c.orderNo}\n`:'')+
      (c.plan?`注文内容：${c.plan}\n`:'')+
      (c.amount?`返金金額：${c.amount}\n`:'')+
      `\n・返金方法：ご購入時のお支払い方法にてご返金\n`+
      `・返金時期：お支払い方法により異なります\n\n`+
      `＜返金目安＞\n`+
      `・クレジットカード：7〜14営業日程度（カード会社により異なります）\n`+
      `・Shop Pay／Google Pay／PayPay：3〜5営業日程度\n`+
      `※上記は目安となり、決済会社により前後する場合がございます。`;
    const couponBlock=S.cancelCoupon&&c.couponCode?
      `\n\nまたご旅行の機会がございましたら、ぜひJAPAN & GLOBAL UNLIMITEDをご利用いただけますと幸いです。\n`+
      `お詫びといたしまして、次回ご利用いただけるクーポンをお送りいたします。\n\n`+
      `■ クーポンコード\nクーポンコード：${c.couponCode}（半角英字）\n`+
      `※全商品30％OFF\n※予告なく終了する場合がございますのでご了承ください`:'';
    const body=
      `ご利用状況を確認いたしましたところ、未使用であることが確認されましたため、\n`+
      `返金手続きを進めさせていただきます。\n\n`+
      refundBlock+couponBlock;
    return `${namePrefix(d)}${base()}${q(d,body)}${footer()}`;
  },

  cancel_zero_yen:(d)=>{
    const c=getCancelData();
    if(!S.cancelZeroYenResult) return '';
    const name=c.zyName?`${c.zyName}様\n\n`:'〇〇様\n\n';
    const orderNo=c.zyOrder||'';
    if(S.cancelZeroYenResult==='eligible'){
      return name+
        `平素よりJAPAN & GLOBAL eSIMをご利用いただき、誠にありがとうございます。\n`+
        `この度は、ご利用に際しご不便をおかけしましたこと、心よりお詫び申し上げます。\n\n`+
        `また、つながらなければ0円キャンペーンへご申請いただき、誠にありがとうございました。\n\n`+
        `ご申請内容を確認させていただいた結果、\n`+
        `お客様のご利用状況が本キャンペーンの対象条件に該当していることを確認いたしましたため、\n`+
        `返金手続きを進めさせていただきます。\n\n`+
        `━━━━━━━━━━━━━━━━━━\n■ 返金内容について\n━━━━━━━━━━━━━━━━━━\n`+
        (orderNo?`・注文番号：${orderNo}\n`:'')+
        `・返金金額：全額\n`+
        `・返金方法：ご購入時のお支払い方法にてご返金\n`+
        `・返金時期：お支払い方法により異なります\n\n`+
        `＜返金目安＞\n`+
        `・クレジットカード　　：7〜14営業日程度（カード会社により異なります）\n`+
        `・Shop Pay／Google Pay／PayPay：3〜5営業日程度\n`+
        `※上記は目安となり、決済会社により前後する場合がございます。\n\n`+
        `━━━━━━━━━━━━━━━━━━\n■ 次回ご利用時のクーポンコード\n━━━━━━━━━━━━━━━━━━\n`+
        `この度はご不便をおかけしましたお詫びとして、次回ご利用いただけるクーポンコードをお渡しいたします。\n`+
        `クーポンコード：CONNECT0（半角英字）\n`+
        `　※全商品5％OFF\n　※1回のみご利用いただけます\n　※予告なく終了する場合がございますのでご了承ください\n\n`+
        `━━━━━━━━━━━━━━━━━━\n■ サポートについて\n━━━━━━━━━━━━━━━━━━\n`+
        `LINE公式アカウント：@japan-global\n\n`+
        `この度はご不便をおかけしてしまいましたこと、改めてお詫び申し上げます。\n`+
        `また機会がございましたら、ぜひJAPAN & GLOBAL eSIMをご利用いただけますと幸いです。\n\n`+
        `今後とも何卒よろしくお願い申し上げます。\nイン・プラス サポートセンター`;
    }
    return name+
      `平素よりJAPAN & GLOBAL eSIMをご利用いただき、誠にありがとうございます。\n\n`+
      `この度は、つながらなければ0円キャンペーンへご申請いただき、誠にありがとうございました。\n\n`+
      `社内にて内容を確認させていただきました結果、\n`+
      `大変心苦しいのですが、今回のご申請につきましては\n`+
      `キャンペーンの対象外となる旨をご案内申し上げます。\n\n`+
      `━━━━━━━━━━━━━━━━━━\n■ 今回の判定について\n━━━━━━━━━━━━━━━━━━\n`+
      `今回のご申請につきましては、以下のいずれかの条件に該当している可能性がございます。\n`+
      `・ご利用期限を過ぎてからのご申請\n`+
      `・通信容量が0MBではない状態であった\n`+
      `・キャンペーン期間外のご購入\n`+
      `・対象外商品でのご購入\n`+
      `・その他条件に該当しないケース\n\n`+
      `━━━━━━━━━━━━━━━━━━\n■ サポートについて\n━━━━━━━━━━━━━━━━━━\n`+
      `LINE公式アカウント：@japan-global\n\n`+
      `この度はご期待に添えない結果となってしまい、誠に申し訳ございません。\n`+
      `引き続きJAPAN & GLOBAL eSIMを何卒よろしくお願い申し上げます。\n\n`+
      `イン・プラス サポートセンター`;
  },

  cancel_wrong_order:(d)=>{
    if(S.cancelQrStatus==='read'){
      return `${namePrefix(d)}${base()}${q(d,
        `誠に恐れ入りますが、引換コードがすでにご利用済みのため、\n`+
        `原則としてキャンセル・返金のご対応が難しい状況でございます。`
      )}${footer()}`;
    }
    if(!S.cancelQrStatus) return '';
    const c=getCancelData();
    const body=
      `eSIMがまだダウンロードされていない状態であることを確認いたしました。\n\n`+
      `誠に恐れ入りますが、正しい商品を先にご注文いただき、\n`+
      `新しいご注文番号をお知らせいただけますでしょうか。\n\n`+
      `確認次第、誤注文分の返金手続きをすぐに進めさせていただきます。`;
    return `${namePrefix(d)}${base()}${q(d,body)}${footer()}`;
  },

  receipt:(d)=>`${namePrefix(d)}${base()}${q(d,
    `領収書のご発行につきましては、ご購入時のAmazon/Yahoo注文履歴よりダウンロードいただけます。\n\n`+
    `ウェブサイトからのご購入の場合は、ご注文確認メールをご利用ください。`
  )}${footer()}`,

  generic_format:(d)=>`${namePrefix(d)}${base()}${statusBlock(d)}${
    d.quote?'\n\n＞'+d.quote+'\n\n→（ここに回答を入力）':'\n\n（ここに回答を入力）'
  }${footer()}`,

  // ── Yahoo キャンセル（引換コード前 — キャンセル完了済み） ──
  yahoo_cancel_before:(d)=>{
    const orderNo = document.getElementById('cancel-ya-order')?.value.trim() || '注文番号';
    const jst     = document.getElementById('cancel-ya-jst')?.value.trim()   || getJstDatetime();
    const quote   = d.quote || '注文をキャンセルさせてほしいのですが…';
    return `イン・プラスサポートセンターでございます。以下のお問い合わせ内容につきまして、ご回答申し上げます。\n＞「注文キャンセル」についての質問　${quote}\n→ご注文（${orderNo}）につきましては、${jst}付でキャンセル手続きを完了しております。\n\nご返金がまだ反映されていない場合は、クレジットカード会社での返金処理にお時間がかかっている可能性がございます。\nお手数をおかけいたしますが、一度クレジットカード会社へご確認いただけますと幸いです。\n\n引き続きご不明な点がございましたら、お気軽にご連絡くださいませ。\n今後ともどうぞよろしくお願いいたします。\nイン・プラスサポートセンター`;
  },

  // ── Yahoo キャンセル（引換コード発行後 — 返金不可） ──
  yahoo_cancel_after:(d)=>{
    const orderNo = document.getElementById('cancel-ya-order')?.value.trim() || '注文番号';
    const quote   = d.quote || '注文をキャンセルさせてほしいのですが…';
    return `イン・プラスサポートセンターでございます。以下のお問い合わせ内容につきまして、ご回答申し上げます。\n＞「注文キャンセル」についての質問　${quote}\n→ご注文（${orderNo}）につきましては、誠に恐れ入りますが引換コードがすでに発行されているため、キャンセルおよびご返金のご対応が難しい状況でございます。\n\n何卒ご理解いただけますと幸いでございます。\n今後ともどうぞよろしくお願いいたします。\nイン・プラスサポートセンター`;
  },

  // ── Amazon キャンセル（キャンセル完了済み） ──
  amazon_cancel:(d)=>{
    const orderNo = document.getElementById('cancel-ya-order')?.value.trim() || '（注文番号）';
    const jst     = document.getElementById('cancel-ya-jst')?.value.trim()   || getJstDatetime();
    return `イン・プラスサポートセンターでございます。\n\nご注文（${orderNo}）のキャンセルにつきましては、${jst}付でキャンセル手続きを完了しております。ご返金がまだ反映されていない場合は、クレジットカード会社での返金処理にお時間がかかっている可能性がございます。お手数をおかけいたしますが、一度クレジットカード会社へご確認いただけますと幸いです。\n\n引き続きご不明な点がございましたら、お気軽にご連絡くださいませ。\n今後ともどうぞよろしくお願いいたします。\n\nイン・プラスサポートセンター`;
  },

  // ── Amazon メールアドレス非表示対応 ──
  amazon_email_ng:(d)=>`${base()}${q(d,
    `誠に恐れ入りますが、Amazon規定により、お客様のメールアドレスへの直接配信は禁止されております。現在、弊社側でもお客様のメールアドレスが非表示となっており、メールでのご連絡が叶わない状況となっております。\n（添付の弊社画面スクリーンショットをご参照ください）\n\nお手数をおかけして大変申し訳ございませんが、引き続きAmazonのメッセージセンターにてご連絡いただけますでしょうか。\n先ほど、こちらのAmazonメッセージセンターよりeSIMのご利用情報をお送りしておりますので、お手数ですがもう一度ご確認いただけますでしょうか。\n\n何かご不明な点がございましたら、どうぞお気軽にお申し付けください。`
  )}${footer()}`,
};


// ───────────────────────────────────────────────────────────
// DEVICE FILTER — chỉ giữ hướng dẫn cho thiết bị khách đang dùng
// ───────────────────────────────────────────────────────────
function filterDeviceInstructions(text, device){
  if(!device) return text;
  if(device==='iPhone'){
    // Remove Android inline lines (　【Android】...)
    text = text.replace(/\n[ 　]*【Android】[^\n]*/g, '');
    // Remove 【Androidの場合】 blocks
    text = text.replace(/\n\n【Androidの場合】[\s\S]*?(?=\n\n【|イン・プラス|$)/g, '');
    text = text.replace(/\n【Androidの場合】[\s\S]*?(?=\n\n|イン・プラス|$)/g, '');
    // Clean up remaining iPhone labels
    text = text.replace(/[ 　]*【iPhone】/g, '');
    text = text.replace(/【iPhoneの場合】\n/g, '');
    // Remove Android-only note
    text = text.replace(/※Androidには[^\n]*\n?/g, '');
  } else {
    // Remove iPhone inline lines (　【iPhone】...)
    text = text.replace(/\n[ 　]*【iPhone】[^\n]*/g, '');
    // Remove 【iPhoneの場合】 blocks
    text = text.replace(/\n\n【iPhoneの場合】[\s\S]*?(?=\n\n【|イン・プラス|$)/g, '');
    text = text.replace(/\n【iPhoneの場合】[\s\S]*?(?=\n\n|イン・プラス|$)/g, '');
    // Clean up remaining Android labels
    text = text.replace(/[ 　]*【Android】/g, '');
    text = text.replace(/【Androidの場合】\n/g, '');
    // Remove iPhone-only note for 構成プロファイル
    text = text.replace(/【iPhoneの場合のみ】[\s\S]*?(?=\n\n|イン・プラス|$)/g, '');
  }
  return text;
}

// ───────────────────────────────────────────────────────────
// PHẦN 3: SETTEI WIZARD — CHECKLIST ITEMS (PATH A / PATH B)
// Sửa nội dung hướng dẫn từng bước tại đây
// ───────────────────────────────────────────────────────────

const SETTEI_A=[
  {key:'a_roaming', label:'データローミング', detail:(iv)=>
    `\n① データローミングをONにする\n`+
    `　【iPhone】設定 → モバイル通信 → ${iv} → データローミング → ON\n`+
    `　【Android】設定 → SIMカード → ICCID「${iv}」→ データローミング → ON`
  },
  {key:'a_iccid', label:'ICCIDの一致確認', detail:(iv)=>
    `\n② 端末のICCIDが ${iv} と一致しているか確認\n`+
    `　【iPhone】設定 → 一般 → 情報 → ICCID\n`+
    `　【Android】設定 → 端末情報 → SIM情報 → ICCID`
  },
  {key:'a_esim', label:'eSIMの有効化', detail:(iv)=>
    `\n③ eSIMを有効化する\n`+
    `　【iPhone】設定 → モバイル通信 → ${iv} →「このeSIMを使用する」をON\n`+
    `　【Android】設定 → SIMカード → ${iv} → 有効化`
  },
];

const SETTEI_B=[
  {key:'b_sim', label:'データ通信SIM選択', detail:(iv)=>
    `\n① データ通信のSIM選択\n`+
    `　【iPhone】設定 → モバイル通信 → データ通信 → ICCID「${iv}」を選択\n`+
    `　【Android】設定 → SIMカード → データ通信 → ICCID「${iv}」を選択`
  },
  {key:'b_roaming', label:'データローミング', detail:(iv)=>
    `\n② データローミングをONにする\n`+
    `　【iPhone】設定 → モバイル通信 → ICCID「${iv}」→ データローミング → ON\n`+
    `　【Android】設定 → SIMカード → ICCID「${iv}」→ データローミング → ON`
  },
  {key:'b_network', label:'ネットワーク選択（自動）', detail:(iv)=>
    `\n③ ネットワーク選択を自動にする\n`+
    `　【iPhone】設定 → モバイル通信 → ネットワーク選択 → 自動\n`+
    `　【Android】設定 → SIMカード → ICCID「${iv}」→ ネットワーク選択 → 自動`
  },
  {key:'b_apn', label:'APN設定', detail:(iv,av)=>
    `\n④ APN設定を確認する\n`+
    `　【iPhone】設定 → モバイル通信 → モバイルデータ通信ネットワーク → APN欄に「${av}」\n`+
    `　【Android】設定 → SIMカード → ICCID「${iv}」→ APN → 「${av}」を入力して保存`
  },
  {key:'b_vpn_profile', label:'VPN・構成プロファイル', detail:(iv)=>
    `\n⑤ VPN・構成プロファイルを確認する\n`+
    `　【iPhone】設定 → 一般 → VPNとデバイス管理\n`+
    `　　・VPN → 無効化\n`+
    `　　・構成プロファイルがある場合 → 削除する\n`+
    `　【Android】設定 → ネットワークとインターネット → VPN → 無効化`
  },
];

// subQ key → どのチェックリスト項目をカバーするか
const COVERS={
  a_roaming:['a_roaming'], a_iccid:['a_iccid'], a_esim:['a_esim'],
  b_sim:['b_sim'], b_roaming:['b_roaming'], b_network:['b_network'],
  b_apn:['b_apn'], b_vpn:['b_vpn_profile'], b_profile:['b_vpn_profile'],
  simlock:[]
};


// ───────────────────────────────────────────────────────────
// PHẦN 4: SETTEI WIZARD — CÂU TRẢ LỜI TỪNG SUB-QUESTION
// Sửa nội dung hướng dẫn chi tiết từng vấn đề tại đây
// ───────────────────────────────────────────────────────────

function getSetteiAnswer(subQ,iv,av){
  const m={

    a_roaming:
      `データローミングをONにする手順は以下の通りです。\n\n`+
      `【iPhoneの場合】\n設定 → モバイル通信 → ICCID「${iv}」→ データローミング → ON\n\n`+
      `【Androidの場合】\n設定 → SIMカード → ICCID「${iv}」→ データローミング → ON`,

    a_iccid:
      `端末に表示されているICCIDが ${iv} と一致しているかご確認ください。\n\n`+
      `【iPhoneの場合】\n設定 → 一般 → 情報 → 下にスクロール → ICCID\n\n`+
      `【Androidの場合】\n設定 → 端末情報 → SIM情報 → ICCID（見つからない場合は「SIM」と検索）`,

    a_esim:
      `eSIMを有効化する手順は以下の通りです。\n\n`+
      `【iPhoneの場合】\n設定 → モバイル通信 → ICCID「${iv}」→「このeSIMを使用する」をONに\n\n`+
      `【Androidの場合】\n設定 → SIMカード → ICCID「${iv}」→ 有効化`,

    b_sim:
      `データ通信に使用するSIMを正しく選択する手順は以下の通りです。\n\n`+
      `【iPhoneの場合】\n設定 → モバイル通信 → データ通信 → ICCID「${iv}」を選択\n\n`+
      `【Androidの場合】\n設定 → SIMカード（またはデュアルSIM）→ データ通信 → ICCID「${iv}」を選択`,

    b_roaming:
      `データローミングをONにする手順は以下の通りです。\n\n`+
      `【iPhoneの場合】\n設定 → モバイル通信 → ICCID「${iv}」→ データローミング → ON\n\n`+
      `【Androidの場合】\n設定 → SIMカード → ICCID「${iv}」→ データローミング → ON`,

    b_network:
      `ネットワーク選択を自動に設定する手順は以下の通りです。\n\n`+
      `【iPhoneの場合】\n設定 → モバイル通信 → 通信のオプション → ネットワーク選択 → 自動\n\n`+
      `【Androidの場合】\n設定 → SIMカード → ICCID「${iv}」→ ネットワーク選択 → 自動（Automatic）`,

    b_apn:
      `APN「${av}」を設定する手順は以下の通りです。\n\n`+
      `【iPhoneの場合】\n設定 → モバイル通信 → 通信のオプション → モバイルデータ通信ネットワーク\n`+
      `→「モバイルデータ通信」のAPN欄に「${av}」を入力\n\n`+
      `※設定項目が表示されない場合：機内モードをON → OFFしてからお試しください\n\n`+
      `【Androidの場合】\n設定 → SIMカード → ICCID「${iv}」→ アクセスポイント名（APN）\n`+
      `→「＋」をタップ → APN欄に「${av}」を入力して保存 → 作成したAPNを選択`,

    b_vpn:
      `VPNが有効になっている場合、データ通信に影響することがあります。\n\n`+
      `【iPhoneの場合】\n設定 → 一般 → VPNとデバイス管理 → VPN → オフにする\n\n`+
      `【Androidの場合】\n設定 → ネットワークとインターネット → VPN → 無効化`,

    b_profile:
      `構成プロファイルはiPhoneのみの機能です。通信設定に干渉することがあります。\n\n`+
      `【iPhoneの場合のみ】\n設定 → 一般 → VPNとデバイス管理 →「構成プロファイル」を確認\n`+
      `→ 対象プロファイルをタップ →「プロファイルを削除」→ 削除後、端末を再起動\n\n`+
      `※会社・学校から配布されたプロファイルは削除前に管理者にご確認ください\n`+
      `※Androidには構成プロファイルはありません`,

    simlock:
      `SIMロックがかかっていると、eSIMが正常に動作しない場合があります。\n\n`+
      `【iPhoneの場合】\n設定 → 一般 → 情報 → 下にスクロール →「SIMロック」を確認\n`+
      `・「SIMロックなし」→ 問題ありません\n`+
      `・ロックあり → ご契約キャリアへSIMロック解除をお申し込みください\n\n`+
      `【Androidの場合】\n設定 → 端末情報（または「SIMカードマネージャー」）でSIMロック状態を確認\n`+
      `・ロックあり → ご契約キャリアへSIMロック解除をご依頼ください\n\n`+
      `解除後、端末を再起動してから再度お試しください`,
  };
  return m[subQ]||'';
}


// ───────────────────────────────────────────────────────────
// PHẦN 5: SETTEI WIZARD — TEMPLATE BUILDERS
// Logic kết hợp nội dung và B2B data thành template hoàn chỉnh
// (Thường không cần sửa phần này, chỉ sửa nội dung ở trên)
// ───────────────────────────────────────────────────────────

function buildScreenshotList(path){
  if(path==='A'){
    return `1. eSIM設定画面（eSIM一覧・有効化状況が確認できる画面）\n2. データローミング設定画面`;
  }
  return `1. データ通信SIM選択画面\n2. データローミング設定画面\n3. APN設定画面\n4. ネットワーク選択画面`;
}

function buildSetteiTmpl(d){
  const p = S.parsedB2B;
  const iv = p?.iccid || '[ICCID]';
  const av = p?.apn || '[APN]';
  const plan = p?.plan || '[プラン名]';
  const status = p?.status || '[ステータス]';
  const path = p?.path || null;
  const subQ = S.subQ;
  const swName = document.getElementById('sw-name')?.value.trim()||'';
  const swQuote = document.getElementById('sw-cust-msg')?.value.trim()||'';
  const nameP = (S.ch==='Yahoo'||S.ch==='メール')&&swName ? swName+'様\n\n' : '';

  // Build ICCID lines: system ICCID + device ICCID (if both exist), else just one
  function buildIccidLines(pp, ivv){
    const lines=[];
    if(pp?.systemIccid) lines.push(`購入時のICCID：${pp.systemIccid}`);
    if(pp?.deviceIccid) lines.push(`デバイスに表示したICCID：${pp.deviceIccid}`);
    if(!lines.length)   lines.push(`ICCID：${ivv}`);
    return lines.join('\n');
  }

  let out = nameP + base();
  if(swQuote && S.ch!=="LINE") out += `\n＞${swQuote}`;

  out += `\n→お客様の状況を確認いたしました。\n\n＜確認内容＞\nプラン：${plan}\n${buildIccidLines(p,iv)}\nAPN：${av}\n現在の状態：${status}\n`;

  // ── アクティベーションエラー ──
  if(swIsActivationError()){
    const b2bRaw=swEl('sw-b2b')?.value||'';
    const isInstalled=b2bRaw.includes('インストール済み');
    if(isInstalled){
      out +=
        `\n\nご安心ください。eSIMはすでに端末にインストールされております。\n`+
        `絶対に削除しないようにお願いいたします。\n\n`+
        `日本国内でeSIMを設定された場合、渡航先の回線に\n`+
        `接続できないため「eSIMをアクティベートできません」と\n`+
        `表示されることがございますが、これは正常な状態です。\n\n`+
        `渡航先に到着後、以下の手順でご利用ください。\n`+
        `① eSIM回線をONに切り替える\n`+
        `② データローミングをONにする\n\n`+
        `引き続きご不明な点がございましたら、\nお気軽にご連絡ください。`;
      out += footer();
      return out;
    } else if(W.activAfterTsim){
      out +=
        `\n\nTsimにて確認いたしましたところ、以下の通りご案内いたします。\n\n`+
        `＜ご案内内容＞\n[※Tsimからの回答を元にここに記入してください]\n\n`+
        `引き続きご不明な点がございましたら、お気軽にご連絡ください。`;
      out += footer();
      return out;
    } else {
      return '';
    }
  }

  // ── QRコード未生成 / パス不明 ──
  if(!path){
    if(p?.status==='QRコード未生成'){
      out +=
        `\n現在QRコードがまだ生成されていないため、ICCID情報が表示されておりませんが、これは正常な状態です。\n\n`+
        `＜次のステップ＞添付資料をご確認下さいませ。\n\n`+
        `１）eSIMを取得する\n「引き換えコード」をコピーして「専用URL」内指定箇所に張り付け下さいませ。\n→eSIMが登場致します。\n\n`+
        `２）ダウンロード\n・iPhone：そのまま「eSIMをダウンロード」で完了致します。\n・Android：機種によってAPN設定が必要ですので、添付資料をご参照下さい。\n\n`+
        `３）ご利用開始\nダウンロードされた「後」に以下をご確認下さい：\n・ご利用地に到着している事\n・eSIMをローミングONにする事`;
    } else {
      out +=
        `\nお客様の状況を詳細に確認するため、以下の点をご確認いただけますでしょうか。\n\n`+
        `① eSIMがインストールされているかご確認ください\n`+
        `② データローミングをONにしてください\n`+
        `③ 現地到着後、eSIMをONにしてください\n\n`+
        `また、以下のスクリーンショットをお送りいただけますでしょうか：\n`+
        `・SIM設定画面\n・データローミング設定画面\n・APN設定画面`;
    }
    out += footer();
    return out;
  }

  const allItems = path==='A' ? SETTEI_A : SETTEI_B;
  const nums=['①','②','③','④','⑤'];
  const screenshotSuffix = `\n\n───────────────────────\n上記をお試しいただいても改善しない場合は、以下の設定画面のスクリーンショットをお送りいただけますでしょうか。\n${buildScreenshotList(path)}`;

  // ── スクリーンショットあり（チェック済み項目） ──
  if(W.screenshot==='yes' && W.checkedItems && W.checkedItems.size>0){
    const done = allItems.filter(it=>W.checkedItems.has(it.key));
    const remaining = allItems.filter(it=>!W.checkedItems.has(it.key));
    if(done.length>0){
      out+=`\n\nスクリーンショットにて${done.map(it=>it.label).join('と')}の設定が完了していることを確認いたしました。`;
    }
    if(remaining.length>0){
      out+=`\n\n引き続き以下の点もご確認いただけますでしょうか。\n`;
      remaining.forEach((item,i)=>{
        let detail=item.detail(iv,av);
        detail=detail.replace(/^(\s*)[①②③④⑤]/m,`$1${nums[i]}`);
        out+=detail;
      });
      out+=screenshotSuffix;
    }else{
      out+=`\n\nすべての基本設定が完了していることを確認いたしました。\n引き続き現地にてご使用いただき、接続状況をご確認ください。`;
    }
    out+=footer(); return out;
  }

  // ── サブQ回答 ──
  if(subQ){
    const answer=getSetteiAnswer(subQ,iv,av);
    if(answer){
      const statusLine = path==='B'
        ? `現在eSIMは「有効化」の状態となっております。\n`
        : `現在eSIMは「無効化」の状態となっております。\n`;
      out+=`\n${statusLine}${answer}\n`;
      const covered=COVERS[subQ]||[];
      const remaining=allItems.filter(it=>!covered.includes(it.key));
      if(remaining.length){
        out+=`\nなお、上記の設定後も接続できない場合は、\n以下の点もあわせてご確認いただけますでしょうか。\n`;
        remaining.forEach((item,i)=>{
          let detail=item.detail(iv,av);
          detail=detail.replace(/^(\s*)[①②③④⑤]/m,`$1${nums[i]}`);
          out+=detail;
        });
        out+=screenshotSuffix;
      }
    }
  } else {
    // ── フルチェックリスト ──
    if(path==='A'){
      out+=`\n現在eSIMは「無効化」の状態となっております。\n以下の順番でご確認いただけますでしょうか。\n`;
    }else{
      out+=`\n現在eSIMは「有効化」の状態となっております。\n接続のため、以下の設定をご確認いただけますでしょうか。\n`;
    }
    allItems.forEach(item=>{out+=item.detail(iv,av);});
    out+=screenshotSuffix;
  }

  out+=footer();
  // Filter to device-specific instructions if device detected
  if(S.parsedB2B?.device) out = filterDeviceInstructions(out, S.parsedB2B.device);
  return out;
}

function buildQrTmpl(d){
  if(!W.qrCase) return '';
  const p=S.parsedB2B;
  const swQuote=swEl('sw-cust-msg')?.value.trim()||'';
  const swName=swEl('sw-name')?.value.trim()||'';
  const nameP=(S.ch==='Yahoo'||S.ch==='メール')&&swName?swName+'様\n\n':'';
  let out=nameP+base();
  if(swQuote && S.ch!=="LINE") out+=`\n＞${swQuote}`;

  if(W.qrCase==='qr_method'){
    const b2bRaw=swEl('sw-b2b')?.value||'';
    const isInstalled=b2bRaw.includes('インストール済み');
    if(isInstalled){
      out+=
        `\n→お客様のeSIMはすでにインストール済みです。QRコードの再読み取りは不要です。\n\n`+
        `eSIM設定画面にeSIMが表示されているかご確認ください。`;
    } else {
      out+=
        `\n→お客様のeSIMはまだインストールが完了していない状態でございます。\n`+
        `以下の手順で再度QRコードの読み取りをお試しください。\n\n`+
        `【iPhoneの場合】\n`+
        `①「設定」→「モバイル通信」→「eSIM（モバイル通信プラン）を追加」→「QRコードを使用」を選択してください。\n`+
        `② QRコードを読み取ってください。\n`+
        `※QRコードを読み取れない場合は、QRコードを別の端末に表示して読み取りをお試しください。\n`+
        `③「モバイル通信プランが検出されました」と表示されましたら、「続ける」をタップしてください。\n\n`+
        `【Androidの場合】\n`+
        `①「設定」→「ネットワークとインターネット」→「モバイルネットワーク」の横にある「＋」→「SIMをダウンロードしますか？」→「次へ」を選択してください。\n`+
        `② QRコードを読み取ってください。\n`+
        `※QRコードを読み取れない場合は、QRコードを別の端末に表示して読み取りをお試しください。\n`+
        `③「モバイル通信プランが検出されました」と表示されましたら、「続ける」をタップしてください。\n\n`+
        `インストール完了後、ご利用地に到着されましたら、追加したeSIMの「データローミング」をONにしてご利用ください。`;
    }
    out+=footer();
    return out;
  }

  if(W.qrCase==='qr_invalid'){
    const b2bRaw=swEl('sw-b2b')?.value||'';
    const isInstalled=b2bRaw.includes('インストール済み');
    if(isInstalled){
      const qp=S.parsedB2B;
      const qiv=qp?.deviceIccid||qp?.systemIccid||qp?.iccid||'';
      const iccidStr=qiv?`「${qiv}」`:'';
      const av=qp?.apn||'[APN]';
      const dev=qp?.device||'both';
      const isIphone=dev==='iPhone'||dev==='both';
      const isAndroid=dev==='Android'||dev==='both';
      // ＜確認内容＞ block
      const kakuninLines=[];
      if(qp?.plan) kakuninLines.push(`プラン：${qp.plan}`);
      if(qp?.systemIccid) kakuninLines.push(`購入時のICCID：${qp.systemIccid}`);
      if(qp?.deviceIccid) kakuninLines.push(`デバイスに表示したICCID：${qp.deviceIccid}`);
      if(!qp?.systemIccid && !qp?.deviceIccid && qiv) kakuninLines.push(`ICCID：${qiv}`);
      if(qp?.apn)  kakuninLines.push(`APN：${qp.apn}`);
      if(qp?.status) kakuninLines.push(`現在の状態：${qp.status}`);
      const kakunin=kakuninLines.length?`\n→お客様の状況を確認いたしました。\n＜確認内容＞\n${kakuninLines.join('\n')}\n\n`:`\n`;
      // 有効化済み or 未有効化
      const isEnabled=b2bRaw.includes('Enabled')||(b2bRaw.includes('有効化された')&&!b2bRaw.includes('有効化されていない'));
      if(isEnabled){
        // 有効化済み → 接続トラブルシューティング
        const iphoneSteps=
          `① eSIMのネットワーク名を確認する\n`+
          `設定 → 一般 → 情報 → 下にスクロール → ICCID${iccidStr}の横に表示されているネットワーク名をご確認ください\n\n`+
          `② データローミングをONにする\n`+
          `設定 → モバイル通信 → ①で確認したネットワーク名のSIM → データローミング → ON\n\n`+
          `ローミングをONにしていただいた後、接続できるかご確認ください。\n`+
          `改善しない場合は、続けて以下の手順もお試しいただけますでしょうか。\n\n`+
          `③ APN設定を確認する\n`+
          `設定 → モバイル通信 → ①で確認したネットワーク名のSIM → モバイルデータ通信ネットワーク → APN欄に「${av}」と入力\n\n`;
        const androidSteps=
          `① eSIMのネットワーク名を確認する\n`+
          `設定 → 端末情報 → SIM情報 → ICCID${iccidStr}の横に表示されているネットワーク名をご確認ください\n\n`+
          `② データローミングをONにする\n`+
          `設定 → SIMとモバイルネットワーク → ①で確認したネットワーク名のSIM → データローミング → ON\n\n`+
          `ローミングをONにしていただいた後、接続できるかご確認ください。\n`+
          `改善しない場合は、続けて以下の手順もお試しいただけますでしょうか。\n\n`+
          `③ APN設定を確認する\n`+
          `設定 → SIMとモバイルネットワーク → ①で確認したネットワーク名のSIM → APN → 「${av}」と入力\n\n`;
        let stepsBlock='';
        if(isIphone&&isAndroid){
          stepsBlock=`【iPhoneの場合】\n`+iphoneSteps+`【Androidの場合】\n`+androidSteps;
        } else if(isIphone){
          stepsBlock=iphoneSteps;
        } else {
          stepsBlock=androidSteps;
        }
        out+=kakunin+
          `弊社にて確認したところ、eSIMは正常にインストール・有効化されております。\n`+
          `端末にeSIMが存在するかご確認のうえ、以下の手順をお試しいただけますでしょうか。\n\n`+
          stepsBlock+
          `それでも改善しない場合は、お知らせいただけますでしょうか🙏`;
      } else {
        // 未有効化 → インストール確認のみ
        out+=kakunin+
          `eSIMのQRコードは一度読み取られると無効となる仕様のため、`+
          `再度スキャンしようとした際に「コードは有効ではありません」と表示されます。\n`+
          `現在の状態を確認いたしましたところ、eSIMはすでに端末へのインストールが`+
          `完了しておりますので、ご安心ください。\n\n`+
          `念のため、以下の手順でインストール状況をご確認いただけますでしょうか。\n\n`+
          `【iPhoneの場合】\n`+
          `①「設定」→「一般」→「情報」→ 下にスクロールし、ICCIDの欄に${iccidStr}と表示されているかご確認ください。\n`+
          `②「設定」→「モバイル通信」→ eSIMのプランが一覧に表示されているかご確認ください。\n\n`+
          `【Androidの場合】\n`+
          `①「設定」→「端末情報」（または「デバイス情報」）→「SIM情報」→ ICCIDの欄に${iccidStr}と表示されているかご確認ください。\n`+
          `②「設定」→「接続」→「SIMカードマネージャー」（機種によって名称が異なります）→ eSIMプロファイルが表示されているかご確認ください。\n\n`+
          `eSIMが確認できましたら、渡航先ご到着後にデータローミングをONにしてご利用開始いただけます。\n\n`+
          `もしeSIMが表示されていない場合は、お手数ですが再度ご連絡いただけますでしょうか。\n`+
          `改めてお客様の状況を確認いたします。`;
      }
    } else {
      out+=
        `\n\nこのたびはご不便をおかけして誠に申し訳ございません。\n`+
        `現在、担当部署に確認中でございます。\n`+
        `今しばらくお待ちいただけますでしょうか。`;
    }
    out+=footer();
    swUpdateQrTsimTmpl();
    return out;
  }
  return '';
}

function buildEsimDeletedTmpl(d){
  const swQuote=swEl('sw-cust-msg')?.value.trim()||'';
  const swName=swEl('sw-name')?.value.trim()||'';
  const nameP=(S.ch==='Yahoo'||S.ch==='メール')&&swName?swName+'様\n\n':'';
  let out=nameP+base();
  if(swQuote && S.ch!=="LINE") out+=`\n＞${swQuote}`;

  if(!W.esimDelAfterTsim){
    out+=
      `\nこのたびはご不便をおかけして誠に申し訳ございません。\n`+
      `現在、担当部署に確認中でございます。\n`+
      `今しばらくお待ちいただけますでしょうか。`;
    out+=footer();
    return out;
  }

  const newLink=swEl('sw-esim-new-link')?.value.trim()||'';
  out+=
    `\n誠に恐れ入りますが、一度削除されたeSIMは再インストールができかねます。\n`+
    `新しいQRコードを発行いたしましたので、お手数ですが再度インストールをお願いいたします。`;
  if(newLink) out+=`\n\n以下のリンクよりeSIMをインストールしてください：\n${newLink}`;
  out+=
    `\n\n【iPhoneの場合】\nSafariでQRコードの画像を長押し→「eSIMを追加」をタップしてください。\n\n`+
    `【Androidの場合】\nGoogle レンズまたはカメラアプリでQRコードを読み取ってください。\n\n`+
    `読み取り完了後は、以下の手順でご利用開始いただけます：\n\n`+
    `２）ダウンロード\n・iPhone：「eSIMをダウンロード」をタップして完了です。\n`+
    `・Android：機種によってAPN設定が必要ですので、添付資料をご参照ください。\n\n`+
    `３）ご利用開始\n・ご利用地に到着していること\n・eSIMのローミングをONにすること`;
  out+=footer();
  return out;
}

function buildExchangeTmpl(){
  const ed=S.exchData||{};
  const name=swEl('sw-name')?.value.trim()||'';
  const nameP=(S.ch==='Yahoo'||S.ch==='メール')&&name?`${name}様\n\n`:'';
  const swQuote=(swEl('sw-cust-msg')?.value.trim()||'').split('\n')[0];
  let out=nameP+base();
  if(swQuote && S.ch!=="LINE") out+=`\n＞${swQuote}`;
  out+=
    `\n→お客様の状況を確認いたしました。\n＜確認内容＞\n`+
    `プラン：${ed.plan||'[プラン名]'}\n`+
    `引き換えコード：${ed.code||'[引き換えコード]'}\n現在の状態：QRコード未生成`;
  out+=
    `\n\n現在QRコードがまだ生成されていないため、ICCID情報が表示されておりませんが、これは正常な状態です。\n\n`+
    `＜次のステップ＞添付資料をご確認下さいませ。\n\n`+
    `１）eSIMを取得する\n「引き換えコード」をコピーして「専用URL」内指定箇所に張り付け下さいませ。\n→eSIMが登場致します。\n\n`+
    `２）ダウンロード\n・iPhone：そのまま「eSIMをダウンロード」で完了致します。\n`+
    `・Android：機種によってAPN設定が必要ですので、添付資料をご参照下さい。\n\n`+
    `３）ご利用開始\nダウンロードされた「後」に以下をご確認下さい：\n・ご利用地に到着している事\n・eSIMをローミングONにする事`;
  out+=footer();
  return out;
}


// =============================================================
//  ENGLISH TEMPLATES
// =============================================================

function baseEN(){
  const ch=S.ch;
  if(ch==='LINE')   return `Thank you for contacting us!`;
  if(ch==='Amazon') return `Thank you for purchasing JAPAN & GLOBAL eSIM on Amazon.\nThis is the IN-PLUS Support Center.\n\nWe would like to respond to your inquiry regarding the following.`;
  return `Thank you for your inquiry.\nThis is the IN-PLUS Support Center.\n\nWe would like to respond to your inquiry regarding the following.`;
}

function footerEN(){
  const ch=S.ch;
  if(ch==='LINE') return `\n\nThank you for your continued support.`;
  return `\n\nThank you for your continued support.\nIN-PLUS Support Center`;
}

function namePrefixEN(d){
  if((S.ch==='Yahoo'||S.ch==='メール')&&d.name) return `Dear ${d.name},\n\n`;
  return '';
}

function qEN(d,ans){
  if(S.ch==='LINE') return `\n\n${ans}`;
  return d.quote?`\n>${d.quote}\n→${ans}`:`\n\n${ans}`;
}

// ── English SETTEI checklists ──

const SETTEI_A_EN=[
  {key:'a_roaming', label:'Data Roaming', detail:(iv)=>
    `\n① Enable Data Roaming\n`+
    `　[iPhone] Settings → Mobile Data → ${iv} → Data Roaming → ON\n`+
    `　[Android] Settings → SIM Card → ICCID "${iv}" → Data Roaming → ON`
  },
  {key:'a_iccid', label:'Verify ICCID', detail:(iv)=>
    `\n② Verify ICCID\n`+
    `　Please confirm that the ICCID displayed on your device matches ${iv}.\n`+
    `　[iPhone] Settings → General → About → ICCID\n`+
    `　[Android] Settings → About Phone → SIM Info → ICCID`
  },
  {key:'a_esim', label:'Activate eSIM', detail:(iv)=>
    `\n③ Activate eSIM\n`+
    `　[iPhone] Settings → Mobile Data → ${iv} → "Use This Plan" → ON\n`+
    `　[Android] Settings → SIM Card → ${iv} → Enable`
  },
];

const SETTEI_B_EN=[
  {key:'b_sim', label:'Select eSIM for Data', detail:(iv)=>
    `\n① Select eSIM for Data\n`+
    `　[iPhone] Settings → Mobile Data → Data → select ${iv}\n`+
    `　[Android] Settings → SIM Card → Mobile Data SIM → select ${iv}`
  },
  {key:'b_roaming', label:'Enable Data Roaming', detail:(iv)=>
    `\n② Enable Data Roaming\n`+
    `　[iPhone] Settings → Mobile Data → ${iv} → Data Roaming → ON\n`+
    `　[Android] Settings → SIM Card → ICCID "${iv}" → Data Roaming → ON`
  },
  {key:'b_network', label:'Network Selection (Auto)', detail:(iv)=>
    `\n③ Network Selection (Auto)\n`+
    `　[iPhone] Settings → Mobile Data → Network Selection → Automatic\n`+
    `　[Android] Settings → SIM Card → ${iv} → Network → Automatic`
  },
  {key:'b_apn', label:'APN Settings', detail:(iv,av)=>
    `\n④ APN Settings\n`+
    `　Please enter "${av}" in the APN field.\n`+
    `　[iPhone] Settings → Mobile Data → Mobile Data Options → Mobile Data Network → APN: "${av}"\n`+
    `　[Android] Settings → SIM Card → ${iv} → Access Point Names (APN) → tap "+" → enter "${av}" → save`
  },
  {key:'b_vpn_profile', label:'VPN & Configuration Profile', detail:()=>
    `\n⑤ VPN & Configuration Profile\n`+
    `　If VPN is active, please disable it.\n`+
    `　[iPhone only] Settings → General → VPN & Device Management → check and remove any configuration profiles.\n`+
    `　※ Android does not have configuration profiles.`
  },
];

function buildScreenshotListEN(path){
  if(path==='A') return `1. eSIM settings screen (showing eSIM list and activation status)\n2. Data Roaming settings screen`;
  return `1. Data SIM selection screen\n2. Data Roaming settings screen\n3. APN settings screen\n4. Network selection screen`;
}

function getSetteiAnswerEN(subQ,iv,av){
  const m={
    a_roaming:
      `Here are the steps to enable Data Roaming:\n\n`+
      `[iPhone]\nSettings → Mobile Data → ICCID "${iv}" → Data Roaming → ON\n\n`+
      `[Android]\nSettings → SIM Card → ICCID "${iv}" → Data Roaming → ON`,
    a_iccid:
      `Please confirm that the ICCID displayed on your device matches ${iv}.\n\n`+
      `[iPhone]\nSettings → General → About → scroll down → ICCID\n\n`+
      `[Android]\nSettings → About Phone → SIM Info → ICCID`,
    a_esim:
      `Here are the steps to activate your eSIM:\n\n`+
      `[iPhone]\nSettings → Mobile Data → ICCID "${iv}" → "Use This Plan" → ON\n\n`+
      `[Android]\nSettings → SIM Card → ICCID "${iv}" → Enable`,
    b_sim:
      `Here are the steps to select your eSIM for data:\n\n`+
      `[iPhone]\nSettings → Mobile Data → Data → select ${iv}\n\n`+
      `[Android]\nSettings → SIM Card → Mobile Data SIM → select ${iv}`,
    b_roaming:
      `Here are the steps to enable Data Roaming:\n\n`+
      `[iPhone]\nSettings → Mobile Data → ICCID "${iv}" → Data Roaming → ON\n\n`+
      `[Android]\nSettings → SIM Card → ICCID "${iv}" → Data Roaming → ON`,
    b_network:
      `Here are the steps to set Network Selection to Automatic:\n\n`+
      `[iPhone]\nSettings → Mobile Data → Mobile Data Options → Network Selection → Automatic\n\n`+
      `[Android]\nSettings → SIM Card → ICCID "${iv}" → Network → Automatic`,
    b_apn:
      `Here are the steps to configure APN "${av}":\n\n`+
      `[iPhone]\nSettings → Mobile Data → Mobile Data Options → Mobile Data Network → APN: "${av}"\n`+
      `※ If the option is not visible, try toggling Airplane Mode ON → OFF\n\n`+
      `[Android]\nSettings → SIM Card → ICCID "${iv}" → Access Point Names (APN)\n`+
      `→ tap "+" → enter "${av}" → save → select the APN you created`,
    b_vpn:
      `If VPN is enabled, it may interfere with data connectivity.\n\n`+
      `[iPhone]\nSettings → General → VPN & Device Management → VPN → disable\n\n`+
      `[Android]\nSettings → Network & Internet → VPN → disable`,
    b_profile:
      `Configuration profiles are an iPhone-only feature and may interfere with connectivity settings.\n\n`+
      `[iPhone only]\nSettings → General → VPN & Device Management → check "Configuration Profile"\n`+
      `→ tap the profile → "Remove Profile" → restart your device after removal\n\n`+
      `※ Please check with your organization before removing a company/school-issued profile\n`+
      `※ Android does not have configuration profiles`,
    simlock:
      `If SIM lock is enabled, your eSIM may not work properly.\n\n`+
      `[iPhone] Settings → General → About → scroll down → check "SIM Lock"\n`+
      `・"No SIM restrictions" → no issue\n`+
      `・Locked → please contact your carrier to unlock\n\n`+
      `[Android] Settings → About Device (or SIM Card Manager) → check SIM lock status\n`+
      `・Locked → please contact your carrier to unlock\n\n`+
      `After unlocking, please restart your device and try again`,
  };
  return m[subQ]||'';
}

function buildSetteiTmplEN(d){
  const p=S.parsedB2B;
  const iv=p?.iccid||'[ICCID]';
  const iccidLabel=p?.deviceIccid?'Device ICCID':'ICCID';
  const av=p?.apn||'[APN]';
  const plan=p?.plan||'[Plan Name]';
  const status=p?.status||'[Status]';
  const path=p?.path||null;
  const subQ=S.subQ;
  const swName=document.getElementById('sw-name')?.value.trim()||'';
  const swQuote=document.getElementById('sw-cust-msg')?.value.trim()||'';
  const nameP=(S.ch==='Yahoo'||S.ch==='メール')&&swName?`Dear ${swName},\n\n`:'';

  let out=nameP+baseEN();
  if(swQuote && S.ch!=='LINE') out+=`\n>${swQuote}`;
  out+=`\n→We have checked your eSIM status.\n<Details>\nPlan: ${plan}\n${iccidLabel}: ${iv}\nAPN: ${av}\nCurrent status: ${status}\n`;

  if(swIsActivationError()){
    const b2bRaw=swEl('sw-b2b')?.value||'';
    const isInstalled=b2bRaw.includes('インストール済み');
    if(isInstalled){
      out+=
        `\n\nYour eSIM has already been installed on your device. Please do not delete it.\n\n`+
        `The "Unable to Activate" message may appear when setting up an eSIM in Japan, but this is normal behavior.\n`+
        `Your eSIM will activate automatically once you arrive at your destination. Please do not worry.`;
      out+=footerEN(); return out;
    } else if(W.activAfterTsim){
      out+=
        `\n\nWe have checked with our team and would like to share the following:\n\n`+
        `<Information>\n[Please fill in based on Tsim's response]\n\n`+
        `If you have any further questions, please do not hesitate to contact us.`;
      out+=footerEN(); return out;
    } else { return ''; }
  }

  if(!path){
    if(p?.status==='QRコード未生成'){
      out+=
        `\n\nYour QR code has not been generated yet, so the ICCID is not displayed — this is normal.\n\n`+
        `<Next Steps> Please refer to the attached guide.\n\n`+
        `1) Get your eSIM\nCopy your "Redemption Code" and paste it at the designated field on the dedicated URL.\n→ Your eSIM will appear.\n\n`+
        `2) Download\n・iPhone: tap "Download eSIM" to complete.\n・Android: APN settings may be required. Please refer to the attached guide.\n\n`+
        `3) Start using\n・Make sure you have arrived at your destination\n・Enable data roaming on your eSIM`;
    } else {
      out+=
        `\n\nTo understand your situation better, could you please confirm the following:\n\n`+
        `① Check that your eSIM has been installed\n`+
        `② Enable Data Roaming\n`+
        `③ After arriving at your destination, enable your eSIM\n\n`+
        `Could you also send us screenshots of:\n`+
        `・SIM settings screen\n・Data Roaming settings screen\n・APN settings screen`;
    }
    out+=footerEN(); return out;
  }

  const allItems=path==='A'?SETTEI_A_EN:SETTEI_B_EN;
  const nums=['①','②','③','④','⑤'];
  const screenshotSuffix=`\n\n───────────────────────\nIf the issue persists after trying the above steps, could you please send us screenshots of each settings screen?\n${buildScreenshotListEN(path)}`;

  if(W.screenshot==='yes' && W.checkedItems && W.checkedItems.size>0){
    const done=allItems.filter(it=>W.checkedItems.has(it.key));
    const remaining=allItems.filter(it=>!W.checkedItems.has(it.key));
    if(done.length>0) out+=`\n\nWe have confirmed from your screenshots that ${done.map(it=>it.label).join(' and ')} ${done.length>1?'are':'is'} correctly set up.`;
    if(remaining.length>0){
      out+=`\n\nCould you also check the following:\n`;
      remaining.forEach((item,i)=>{let det=item.detail(iv,av);det=det.replace(/^(\s*)[①②③④⑤]/m,`$1${nums[i]}`);out+=det;});
      out+=screenshotSuffix;
    } else {
      out+=`\n\nAll basic settings have been confirmed. Please try using your eSIM at your destination and check the connection status.`;
    }
    out+=footerEN(); return out;
  }

  if(subQ){
    const answer=getSetteiAnswerEN(subQ,iv,av);
    if(answer){
      out+=`\n\n${answer}\n`;
      const covered=COVERS[subQ]||[];
      const remaining=allItems.filter(it=>!covered.includes(it.key));
      if(remaining.length){
        out+=`\nIf the issue persists after the above, could you also check the following:\n`;
        remaining.forEach((item,i)=>{let det=item.detail(iv,av);det=det.replace(/^(\s*)[①②③④⑤]/m,`$1${nums[i]}`);out+=det;});
        out+=screenshotSuffix;
      }
    }
  } else {
    if(path==='A'){
      out+=`\nYour eSIM is currently in "Disabled" state.\nCould you please check the following steps in order?\n`;
    } else {
      out+=`\nYour eSIM is currently in "Enabled" state.\nTo establish a connection, could you please check the following settings?\n`;
    }
    allItems.forEach(item=>{out+=item.detail(iv,av);});
    out+=screenshotSuffix;
  }

  out+=footerEN();
  return out;
}

function buildQrTmplEN(d){
  if(!W.qrCase) return '';
  const swQuote=swEl('sw-cust-msg')?.value.trim()||'';
  const swName=swEl('sw-name')?.value.trim()||'';
  const nameP=(S.ch==='Yahoo'||S.ch==='メール')&&swName?`Dear ${swName},\n\n`:'';
  let out=nameP+baseEN();
  if(swQuote && S.ch!=='LINE') out+=`\n\n>${swQuote}`;

  if(W.qrCase==='qr_method'){
    const b2bRaw=swEl('sw-b2b')?.value||'';
    const isInstalled=b2bRaw.includes('インストール済み');
    if(isInstalled){
      out+=`\n\n→Your eSIM has already been installed. No need to scan the QR code again.\n\nPlease check your eSIM settings screen to confirm it is listed.`;
    } else {
      out+=
        `\n\n→Your eSIM has not been installed yet.\n`+
        `Could you please try scanning the QR code again using the steps below?\n\n`+
        `[iPhone]\nLong-press the QR code image in Safari → tap "Add eSIM".\n\n`+
        `[Android]\nUse Google Lens or your camera app to scan the QR code.\n`+
        `※ Some devices support QR code scanning directly via the camera app.\n\n`+
        `After scanning, please follow these steps to start using your eSIM:\n\n`+
        `2) Download\n・iPhone: tap "Download eSIM" to complete.\n`+
        `・Android: APN settings may be required depending on your device. Please refer to the attached guide.\n\n`+
        `3) Start using\n・Make sure you have arrived at your destination\n・Enable data roaming on your eSIM`;
    }
    out+=footerEN(); return out;
  }

  if(W.qrCase==='qr_invalid'){
    const b2bRaw=swEl('sw-b2b')?.value||'';
    const isInstalled=b2bRaw.includes('インストール済み');
    if(isInstalled){
      out+=
        `\n\nAs QR codes can only be scanned once, you will see "Code is not valid" if you try to scan it again.\n`+
        `We have confirmed that your eSIM has already been successfully installed on your device. Please do not worry.\n\n`+
        `You can verify the installation status here:\n\n`+
        `[iPhone]\nSettings → Mobile Data → confirm your eSIM plan is listed\n\n`+
        `[Android]\nSettings → SIM Card → confirm your eSIM is listed\n\n`+
        `Once confirmed, please enable Data Roaming after arriving at your destination.\n\n`+
        `If your eSIM is not listed, please contact us and we will check further.`;
    } else {
      out+=
        `\n\nWe sincerely apologize for the inconvenience.\n`+
        `We are currently checking with our team.\n`+
        `Could you please wait a moment?`;
    }
    out+=footerEN();
    swUpdateQrTsimTmpl();
    return out;
  }
  return '';
}

function buildEsimDeletedTmplEN(d){
  const swQuote=swEl('sw-cust-msg')?.value.trim()||'';
  const swName=swEl('sw-name')?.value.trim()||'';
  const nameP=(S.ch==='Yahoo'||S.ch==='メール')&&swName?`Dear ${swName},\n\n`:'';
  let out=nameP+baseEN();
  if(swQuote && S.ch!=='LINE') out+=`\n\n>${swQuote}`;

  if(!W.esimDelAfterTsim){
    out+=
      `\n\nWe sincerely apologize for the inconvenience.\n`+
      `We are currently checking with our team.\n`+
      `Could you please wait a moment?`;
    out+=footerEN(); return out;
  }

  const newLink=swEl('sw-esim-new-link')?.value.trim()||'';
  out+=
    `\n\nWe regret to inform you that once an eSIM is deleted, it cannot be reinstalled.\n`+
    `We have issued a new QR code. Please reinstall your eSIM using the steps below.`;
  if(newLink) out+=`\n\nPlease install your eSIM from the following link:\n${newLink}`;
  out+=
    `\n\n[iPhone]\nLong-press the QR code image in Safari → tap "Add eSIM".\n\n`+
    `[Android]\nUse Google Lens or your camera app to scan the QR code.\n\n`+
    `After scanning:\n\n`+
    `2) Download\n・iPhone: tap "Download eSIM" to complete.\n`+
    `・Android: APN settings may be required. Please refer to the attached guide.\n\n`+
    `3) Start using\n・Make sure you have arrived at your destination\n・Enable data roaming on your eSIM`;
  out+=footerEN();
  return out;
}

function buildExchangeTmplEN(){
  const ed=S.exchData||{};
  const name=swEl('sw-name')?.value.trim()||'';
  const nameP=(S.ch==='Yahoo'||S.ch==='メール')&&name?`Dear ${name},\n\n`:'';
  const swQuote=(swEl('sw-cust-msg')?.value.trim()||'').split('\n')[0];
  let out=nameP+baseEN();
  if(swQuote && S.ch!=='LINE') out+=`\n>${swQuote}`;
  out+=
    `\n→We have checked your eSIM status.\n<Details>\n`+
    `Plan: ${ed.plan||'[Plan Name]'}\n`+
    `Redemption Code: ${ed.code||'[Redemption Code]'}\nCurrent status: QR code not yet generated`;
  out+=
    `\n\nYour QR code has not been generated yet, so the ICCID is not displayed — this is normal.\n\n`+
    `<Next Steps> Please refer to the attached guide.\n\n`+
    `1) Get your eSIM\nCopy your "Redemption Code" and paste it at the designated field on the dedicated URL.\n→ Your eSIM will appear.\n\n`+
    `2) Download\n・iPhone: tap "Download eSIM" to complete.\n・Android: APN settings may be required. Please refer to the attached guide.\n\n`+
    `3) Start using\n・Make sure you have arrived at your destination\n・Enable data roaming on your eSIM`;
  out+=footerEN();
  return out;
}

// ── English T_EN object ──

const T_EN={

  // 配送・配信
  delivery_not_arrived:(d)=>{
    if(S.ch==='LINE'){
      if(S.deliveryLineStep===1) return `Thank you for contacting us.\nCould you please share your order number?\nWe will check the shipping status and get back to you.${footerEN()}`;
      return '';
    }
    const orderNo=document.getElementById('d-order-no')?.value.trim()||'[Order No.]';
    const shipDate=document.getElementById('d-ship-date')?.value.trim()||'[Date]';
    const trackNo=document.getElementById('d-tracking-no')?.value.trim()||'[Tracking No.]';
    const body=
      `We have checked the shipping status of your order.\n\n`+
      `<Shipping Info>\n`+
      `Order No.: ${orderNo}\n`+
      `Shipped Date: ${shipDate}\n`+
      `Tracking No.: ${trackNo}\n`+
      `Carrier: Japan Post\n\n`+
      `You can track your current delivery status using the tracking number above.\n`+
      `https://trackings.post.japanpost.jp/\n\n`+
      `We appreciate your patience while we deliver your order.\n`+
      `If your order has not arrived after a certain period, please do not hesitate to contact us again.`;
    return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
  },

  delivery_no_email:(d)=>{
    if(S.ch==='LINE'){
      if(S.deliveryLineStep===1) return `Thank you for contacting us.\nCould you please share your order number?\nWe will check the delivery status and get back to you.${footerEN()}`;
      return '';
    }
    const status=S.deliveryEmailStatus;
    if(!status) return '(Please select the email delivery status)';
    if(status==='unsent'){
      const orderTime=document.getElementById('d-order-time')?.value.trim()||'[time]';
      const schedTime=document.getElementById('d-scheduled-time')?.value.trim()||'[estimated time]';
      const body=
        `Our delivery schedule is as follows:\n\n`+
        `・Orders placed before 3:00 PM → delivered by approx. 6:00 PM\n`+
        `・Orders placed after 4:00 PM → delivered by approx. 11:00 AM the next business day\n\n`+
        `We have checked your order time and it was placed at "${orderTime} JST".\n`+
        `Your eSIM will be delivered around ${schedTime}. Please wait a little longer.`;
      return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
    }
    const sentTime=document.getElementById('d-sent-time')?.value.trim()||'[date/time]';
    const body=
      `Your eSIM information was sent on ${sentTime}.\n`+
      `We have also just resent it to your registered email address.\n\n`+
      `Please check your inbox as well as your spam/junk folder.\n\n`+
      `If you are still unable to find it, we can resend it to a different email address. Please feel free to let us know.`;
    return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
  },

  delivery_redeem_code:(d)=>{
    const body=
      `Here are the steps to use your redemption code:\n\n`+
      `【STEP 1】Check\n`+
      `Please locate the redemption code and dedicated URL we sent you.\n\n`+
      `【STEP 2】Redeem\n`+
      `Visit the link below, enter your redemption code (21-digit alphanumeric), and tap "Exchange".\n`+
      `https://redeem.tsimtech.com/RedeemEsimCode/inplus/identify/jp\n`+
      `→ Your QR code and activation code will be displayed.\n\n`+
      `【STEP 3】Setup\n`+
      `■ If you have 2 devices:\nScan the QR code with your other device.\n\n`+
      `■ If you only have 1 device:\nCopy the activation code shown on screen and paste it into your device settings.\n\n`+
      `Once setup is complete, please enable Data Roaming when you arrive at your destination.`;
    return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
  },

  // 商品・サービス確認
  start_date:(d)=>{
    const sc=S.startDateScenario;
    const rawB2b=document.getElementById('f-genjou')?.value.trim()||'';
    if(!sc){
      const body=
        `The usage period begins from the date your eSIM is activated.\n\n`+
        `Activation occurs when all three conditions below are met at your destination:\n`+
        `1) eSIM has been downloaded to your device\n`+
        `2) Data Roaming is set to ON on both your device and eSIM\n`+
        `3) You are in a region supported by your purchased plan\n\n`+
        `Therefore, even if you turn on Roaming before arriving at your destination, the day count will not begin. Please rest assured.`;
      return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
    }
    if(sc==='①'){
      const body=
        `The usage period begins from the date your eSIM is activated.\n\n`+
        `Activation occurs when all three conditions below are met at your destination:\n`+
        `1) eSIM has been downloaded to your device\n`+
        `2) Data Roaming is set to ON on both your device and eSIM\n`+
        `3) You are in a region supported by your purchased plan\n\n`+
        `Therefore, even if you turn on Roaming before arriving at your destination, the day count will not begin. Please rest assured.`;
      return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
    }
    if(sc==='②'){
      if(S.ch==='LINE'){
        if(S.startDateIccid==='no'){
          return `Thank you for contacting us.\nNormally, the usage period begins when you enable Roaming upon arriving at your destination.\n\nTo check your situation more accurately, could you please share your eSIM's ICCID number?${footerEN()}`;
        }
        const rawForCheck=S.startDateRawB2b||rawB2b;
        const isUnused=rawForCheck.includes('未使用');
        if(!isUnused) return '';
        return `Thank you for sharing your ICCID.\nThe usage period begins from the date your eSIM is activated.\nTherefore, even if you enable Data Roaming before arriving at your destination, the day count will not begin. Please rest assured.\n\nWe have checked and confirmed that your eSIM has not been used yet and the day count has not started, so please do not worry.\n\nAs a precaution, could you please keep Data Roaming OFF until departure, and switch it ON after arriving at your destination?\n\nThank you for your cooperation.${footerEN()}`;
      }
      const rawForCheck=S.startDateRawB2b||rawB2b;
      const isUnused=rawForCheck.includes('未使用');
      if(!isUnused) return '';
      const pb=parseB2B(S.startDateRawB2b||rawB2b);
      const plan=pb.plan||'[Plan Name]'; const iccid=pb.iccid||'[ICCID]';
      const ord=document.getElementById('f-note')?.value.trim()||'[Order No.]';
      const body=
        `We have checked your eSIM status.\n\n`+
        `<Details>\nPlan: ${plan}\nOrder No.: ${ord}\nICCID: ${iccid}\nCurrent status: Unused\n\n`+
        `The usage period begins from the date your eSIM is activated.\n`+
        `Activation occurs when you enable Roaming upon arriving at your destination and your device connects to the network.\n\n`+
        `We have confirmed that your eSIM is currently still in "Unused" status, so if it is currently off, there is no issue. Please rest assured.\n\n`+
        `As a precaution, could you please keep Data Roaming OFF until departure, and switch it ON after arriving at your destination?`;
      return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
    }
    return '';
  },

  voice_call:(d)=>{
    const body=
      `We offer two types of eSIM:\n\n`+
      `【Data-only eSIM】\nVoice calls and SMS are not available.\n`+
      `However, calls via apps such as LINE, Skype, or WhatsApp are available using data communication.\n\n`+
      `【eSIM with Phone Number】\nA local phone number is assigned, and voice calls, SMS, and data communication are all available.\n\n`+
      `You can check our products here:\nhttps://esim-globals.com/collections/all`;
    return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
  },

  iccid_how:(d)=>{
    // No EN spec provided — fallback message
    const body=
      `Here are the steps to find your ICCID:\n\n`+
      `[iPhone]\nSettings → General → About → scroll down → ICCID\n\n`+
      `[Android]\nSettings → About Phone → SIM Info → ICCID\n(If not visible, search for "SIM" in Settings)`;
    return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
  },

  usage_status:(d)=>{
    const body=
      `[iPhone]\nSettings → Mobile Data → select your eSIM plan → "Data Usage"\n\n`+
      `[Android]\nSettings → Network & Internet → Data Usage → select your eSIM`;
    return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
  },

  data_add:(d)=>{
    const body=
      `Additional data can be purchased from the link below.\n\n`+
      `[Website/LINE]\nhttps://esim-globals.com/collections/all\n\n`+
      `[Amazon]\nhttps://www.amazon.co.jp/stores/page/E8E6AA41-59B8-4D72-8C38-6F79A49F6DCA\n\n`+
      `[Yahoo]\nPlease search for "JAPAN & GLOBAL" in our Yahoo store.\n\n`+
      `※ Please make sure to select the same plan as your current eSIM when purchasing additional data.`;
    return `${namePrefixEN(d)}${baseEN()}${qEN(d,body)}${footerEN()}`;
  },

  // キャンセル・返金
  cancel_unused:(d)=>{
    const cd=getCancelData();
    const refundBlock=
      `\n\n■ Refund Details\nOrder No.: ${cd.orderNo||'[Order No.]'}\nProduct: ${cd.plan||'[Plan Name]'}\nRefund Amount: ${cd.amount||'[Amount]'}\n\n`+
      `・Refund Method: Refunded to your original payment method\n`+
      `・Refund Timing: Varies depending on payment method\n\n`+
      `<Estimated Refund Timeline>\n`+
      `・Credit card: approx. 7–14 business days (may vary by card issuer)\n`+
      `・Shop Pay / Google Pay / PayPay: approx. 3–5 business days\n\n`+
      `※ The above are estimates and may vary depending on the payment provider.`;
    const couponBlock=S.cancelCoupon&&cd.couponCode
      ?`\n\nWe hope you will consider using JAPAN & GLOBAL UNLIMITED for your next trip.\nAs an apology, we would like to offer you a coupon for your next purchase.\n\n■ Coupon Code\nCoupon Code: ${cd.couponCode} (alphanumeric)\n※ 30% OFF all products\n※ May end without prior notice`:'';
    if(S.cancelQrStatus===null) return `${namePrefixEN(d)}${baseEN()}\n\n(Please select whether the redemption code has been used)${footerEN()}`;
    if(S.cancelQrStatus==='unused'){
      return `${namePrefixEN(d)}${baseEN()}\n\nWe have confirmed that your eSIM has not been downloaded yet.\nWe will proceed with the cancellation and refund.${refundBlock}${couponBlock}${footerEN()}`;
    }
    return `${namePrefixEN(d)}${baseEN()}\n\nWe sincerely apologize, but as the redemption code has already been used,\nwe are unable to process a cancellation or refund in principle.${footerEN()}`;
  },

  cancel_unusable:(d)=>{
    if(S.cancelUnused===null) return `${namePrefixEN(d)}${baseEN()}\n\n(Please select whether the eSIM was used)${footerEN()}`;
    if(!S.cancelUnused) return '';
    const cd=getCancelData();
    const refundBlock=
      `\n\n■ Refund Details\nOrder No.: ${cd.orderNo||'[Order No.]'}\nProduct: ${cd.plan||'[Plan Name]'}\nRefund Amount: ${cd.amount||'[Amount]'}\n\n`+
      `・Refund Method: Refunded to your original payment method\n`+
      `・Refund Timing: Varies depending on payment method\n\n`+
      `<Estimated Refund Timeline>\n`+
      `・Credit card: approx. 7–14 business days (may vary by card issuer)\n`+
      `・Shop Pay / Google Pay / PayPay: approx. 3–5 business days\n\n`+
      `※ The above are estimates and may vary depending on the payment provider.`;
    const couponBlock=S.cancelCoupon&&cd.couponCode
      ?`\n\nWe hope you will consider using JAPAN & GLOBAL UNLIMITED for your next trip.\nAs an apology, we would like to offer you a coupon for your next purchase.\n\n■ Coupon Code\nCoupon Code: ${cd.couponCode} (alphanumeric)\n※ 30% OFF all products\n※ May end without prior notice`:'';
    return `${namePrefixEN(d)}${baseEN()}\n\nWe have checked your usage status and confirmed that your eSIM is unused.\nWe will proceed with the refund.${refundBlock}${couponBlock}${footerEN()}`;
  },

  cancel_zero_yen:(d)=>{
    const cd=getCancelData();
    const name=cd.zyName||'[Name]';
    const orderNo=cd.zyOrder||'[Order No.]';
    const result=S.cancelZeroYenResult;
    if(!result) return '(Please select the campaign result)';
    if(result==='eligible'){
      return `[Notice] Refund – "No Connection, No Charge" Campaign\n\nDear ${name},\n\n`+
        `Thank you for using JAPAN & GLOBAL eSIM.\nWe sincerely apologize for the inconvenience you experienced.\nWe also appreciate your application for our "No Connection, No Charge" campaign.\n\n`+
        `After reviewing your request, we have confirmed that your usage meets the eligibility criteria.\nWe will proceed with the refund.\n\n`+
        `━━━━━━━━━━━━━━━━━━\n■ Refund Details\n━━━━━━━━━━━━━━━━━━\n`+
        `・Order No.: ${orderNo}\n・Refund Amount: Full purchase amount\n`+
        `・Refund Method: Refunded to your original payment method\n・Refund Timing: Varies depending on payment method\n\n`+
        `<Estimated Refund Timeline>\n・Credit card: approx. 7–14 business days (may vary by card issuer)\n・Shop Pay / Google Pay / PayPay: approx. 3–5 business days\n\n`+
        `━━━━━━━━━━━━━━━━━━\n■ Coupon Code for Next Use\n━━━━━━━━━━━━━━━━━━\n`+
        `Coupon Code: CONNECT0\n　※ 5% OFF all products\n　※ Valid for one-time use only\n　※ May end without prior notice\n\n`+
        `━━━━━━━━━━━━━━━━━━\n■ Support\n━━━━━━━━━━━━━━━━━━\nLINE: @japan-global\n\n`+
        `We sincerely apologize again for the inconvenience.\nWe hope to serve you again with JAPAN & GLOBAL eSIM.\n\nIN-PLUS Support Center`;
    }
    return `[Notice] "No Connection, No Charge" Campaign – Application Result\n\nDear ${name},\n\n`+
      `Thank you for applying for our "No Connection, No Charge" campaign.\n\n`+
      `After reviewing your application, we regret to inform you that your request does not meet the eligibility criteria for this campaign.\n\n`+
      `━━━━━━━━━━━━━━━━━━\n■ Reason\n━━━━━━━━━━━━━━━━━━\n`+
      `Your application may fall under one of the following:\n`+
      `・Application submitted after the usage period had ended\n・Data usage was not 0MB\n`+
      `・Purchase made outside the campaign period\n・Product not eligible for the campaign\n・Other conditions not met\n\n`+
      `━━━━━━━━━━━━━━━━━━\n■ Support\n━━━━━━━━━━━━━━━━━━\nLINE: @japan-global\n\n`+
      `We are sorry we could not meet your expectations.\nThank you for your understanding.\n\nIN-PLUS Support Center`;
  },

  cancel_wrong_order:(d)=>{
    const cd=getCancelData();
    const refundBlock=
      `\n\n■ Refund Details (incorrect order)\nOrder No.: ${cd.orderNo||'[Order No.]'}\nProduct: ${cd.plan||'[Plan Name]'}\nRefund Amount: ${cd.amount||'[Amount]'}\n\n`+
      `・Refund Method: Refunded to your original payment method\n`+
      `・Refund Timing: Varies depending on payment method\n\n`+
      `<Estimated Refund Timeline>\n`+
      `・Credit card: approx. 7–14 business days (may vary by card issuer)\n`+
      `・Shop Pay / Google Pay / PayPay: approx. 3–5 business days\n\n`+
      `※ The above are estimates and may vary depending on the payment provider.`;
    if(S.cancelQrStatus===null) return `${namePrefixEN(d)}${baseEN()}\n\n(Please select whether the redemption code has been used)${footerEN()}`;
    if(S.cancelQrStatus==='unused'){
      return `${namePrefixEN(d)}${baseEN()}\n\nWe have confirmed that your eSIM has not been downloaded yet.\n\nCould you please place a new order for the correct product first and share the new order number with us?\nOnce confirmed, we will immediately process the refund for the incorrect order.${footerEN()}`;
    }
    return `${namePrefixEN(d)}${baseEN()}\n\nWe sincerely apologize, but as the redemption code has already been used,\nwe are unable to process a cancellation or refund in principle.${footerEN()}`;
  },
};
