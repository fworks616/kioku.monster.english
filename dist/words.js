import {pre1Details} from './pre1-details.js';
// Original examples and curated practice vocabulary; not an official Eiken list.
const basic = [
['achieve','/əˈtʃiːv/','動詞','達成する','You can achieve your goals with practice.','練習を重ねれば目標を達成できます。'],
['opportunity','/ˌɑːpərˈtuːnəti/','名詞','機会、好機','This is a great opportunity to learn.','これは学ぶ絶好の機会です。'],
['improve','/ɪmˈpruːv/','動詞','改善する、上達する','Reading every day will improve your English.','毎日の読書で英語が上達します。'],
['essential','/ɪˈsenʃəl/','形容詞','必要不可欠な','Sleep is essential for good health.','睡眠は健康に欠かせません。'],
['consider','/kənˈsɪdər/','動詞','よく考える、検討する','Please consider all the options.','すべての選択肢を検討してください。'],
['experience','/ɪkˈspɪriəns/','名詞','経験、体験','Travel gives us valuable experience.','旅行は貴重な経験を与えてくれます。'],
['environment','/ɪnˈvaɪrənmənt/','名詞','環境','We must protect the environment.','私たちは環境を守らなければなりません。'],
['encourage','/ɪnˈkɜːrɪdʒ/','動詞','励ます、促す','Her words encouraged me to try again.','彼女の言葉に励まされてもう一度挑戦しました。'],
['provide','/prəˈvaɪd/','動詞','提供する','The library provides free internet access.','図書館は無料のインターネット接続を提供しています。'],
['develop','/dɪˈveləp/','動詞','発展させる、開発する','We need to develop a better plan.','もっと良い計画を立てる必要があります。'],
['purpose','/ˈpɜːrpəs/','名詞','目的','What is the purpose of this meeting?','この会議の目的は何ですか。'],
['benefit','/ˈbenɪfɪt/','名詞','利益、恩恵','Exercise has many health benefits.','運動は健康に多くの恩恵をもたらします。'],
['require','/rɪˈkwaɪər/','動詞','必要とする','This task requires patience.','この仕事には忍耐が必要です。'],
['available','/əˈveɪləbl/','形容詞','利用できる、入手できる','Tickets are available online.','チケットはオンラインで購入できます。'],
['confident','/ˈkɑːnfɪdənt/','形容詞','自信がある','I feel confident about the exam.','試験には自信があります。'],
['support','/səˈpɔːrt/','動詞','支える、支持する','My family supports my decision.','家族は私の決断を支持しています。'],
['recognize','/ˈrekəɡnaɪz/','動詞','見分ける、認める','I recognized her voice immediately.','私はすぐに彼女の声だとわかりました。'],
['suggest','/səˈdʒest/','動詞','提案する','I suggest taking a short break.','少し休憩することを提案します。'],
['responsible','/rɪˈspɑːnsəbl/','形容詞','責任がある','She is responsible for the project.','彼女がそのプロジェクトの責任者です。'],
['relationship','/rɪˈleɪʃənʃɪp/','名詞','関係','Trust builds a strong relationship.','信頼が強い関係を築きます。'],
['discover','/dɪˈskʌvər/','動詞','発見する','We discovered a quiet café nearby.','近くに静かなカフェを見つけました。'],
['effort','/ˈefərt/','名詞','努力','Your effort will make a difference.','あなたの努力は変化をもたらします。'],
['reduce','/rɪˈduːs/','動詞','減らす','We should reduce food waste.','食品廃棄を減らすべきです。'],
['compare','/kəmˈper/','動詞','比較する','Compare the prices before you buy.','買う前に値段を比較しましょう。'],
['increase','/ɪnˈkriːs/','動詞','増やす、増える','The number of visitors increased.','訪問者の数が増えました。'],
['knowledge','/ˈnɑːlɪdʒ/','名詞','知識','He has a deep knowledge of history.','彼は歴史について深い知識があります。'],
['solution','/səˈluːʃən/','名詞','解決策','Let us find a solution together.','一緒に解決策を見つけましょう。'],
['include','/ɪnˈkluːd/','動詞','含む','The price includes breakfast.','料金には朝食が含まれています。'],
['prevent','/prɪˈvent/','動詞','防ぐ','A helmet can prevent serious injury.','ヘルメットは重傷を防ぐことができます。'],
['valuable','/ˈvæljuəbl/','形容詞','貴重な、価値がある','Thank you for your valuable advice.','貴重なアドバイスをありがとうございます。']
];
const pre1 = [
['resilient','/rɪˈzɪliənt/','形容詞','回復力のある、立ち直りが早い','Children are often remarkably resilient.','子どもたちは驚くほど立ち直りが早いことがあります。'],
['substantial','/səbˈstænʃəl/','形容詞','かなりの、相当な','The project requires substantial investment.','その事業には相当な投資が必要です。'],
['alleviate','/əˈliːvieɪt/','動詞','和らげる、軽減する','The new policy aims to alleviate poverty.','その新しい政策は貧困の軽減を目指しています。'],
['ambiguous','/æmˈbɪɡjuəs/','形容詞','曖昧な、複数の解釈ができる','His answer was deliberately ambiguous.','彼の返事は意図的に曖昧でした。'],
['deteriorate','/dɪˈtɪriəreɪt/','動詞','悪化する、衰える','The weather began to deteriorate.','天気が悪くなり始めました。'],
['inevitable','/ɪnˈevɪtəbl/','形容詞','避けられない、必然的な','Some changes are inevitable.','避けられない変化もあります。'],
['advocate','/ˈædvəkeɪt/','動詞','主張する、提唱する','They advocate equal access to education.','彼らは教育への平等なアクセスを提唱しています。'],
['reluctant','/rɪˈlʌktənt/','形容詞','気が進まない、しぶしぶの','She was reluctant to accept the offer.','彼女はその申し出を受けることに気が進みませんでした。'],
['contemplate','/ˈkɑːntəmpleɪt/','動詞','熟考する','He contemplated a change of career.','彼は転職をじっくり考えました。'],
['undermine','/ˌʌndərˈmaɪn/','動詞','徐々に弱める、損なう','False reports can undermine public trust.','誤った報道は国民の信頼を損なうおそれがあります。'],
['plausible','/ˈplɔːzəbl/','形容詞','もっともらしい','She offered a plausible explanation.','彼女はもっともらしい説明をしました。'],
['scrutinize','/ˈskruːtənaɪz/','動詞','詳しく調べる、精査する','The committee scrutinized the proposal.','委員会はその提案を精査しました。'],
['profound','/prəˈfaʊnd/','形容詞','深い、重大な','The discovery had a profound impact.','その発見は大きな影響を与えました。'],
['allocate','/ˈæləkeɪt/','動詞','割り当てる、配分する','We allocated more time to research.','私たちは研究により多くの時間を割り当てました。'],
['diminish','/dɪˈmɪnɪʃ/','動詞','減少する、弱める','Her enthusiasm did not diminish.','彼女の熱意は衰えませんでした。'],
['coherent','/koʊˈhɪrənt/','形容詞','筋の通った、一貫した','We need a coherent strategy.','筋の通った戦略が必要です。'],
['incentive','/ɪnˈsentɪv/','名詞','動機、奨励金','The bonus provides an incentive to work harder.','その賞与はより熱心に働く動機になります。'],
['constraint','/kənˈstreɪnt/','名詞','制約','We face severe budget constraints.','私たちは厳しい予算の制約に直面しています。'],
['discrepancy','/dɪˈskrepənsi/','名詞','食い違い、不一致','There is a discrepancy between the two reports.','その2つの報告には食い違いがあります。'],
['feasible','/ˈfiːzəbl/','形容詞','実行可能な','The plan is technically feasible.','その計画は技術的に実行可能です。'],
['persistent','/pərˈsɪstənt/','形容詞','粘り強い、持続する','Persistent effort led to success.','粘り強い努力が成功につながりました。'],
['vulnerable','/ˈvʌlnərəbl/','形容詞','傷つきやすい、弱い立場の','The shelter protects vulnerable people.','その施設は弱い立場にある人々を守っています。'],
['compelling','/kəmˈpelɪŋ/','形容詞','説得力のある','She presented compelling evidence.','彼女は説得力のある証拠を示しました。'],
['detrimental','/ˌdetrɪˈmentəl/','形容詞','有害な、不利益な','Lack of sleep is detrimental to health.','睡眠不足は健康に有害です。'],
['foster','/ˈfɑːstər/','動詞','育む、促進する','The program fosters creative thinking.','そのプログラムは創造的な思考を育みます。'],
['imminent','/ˈɪmɪnənt/','形容詞','差し迫った','They warned of imminent danger.','彼らは差し迫った危険を警告しました。'],
['prevalent','/ˈprevələnt/','形容詞','広く見られる、普及している','This belief is prevalent in the region.','この考えはその地域で広く見られます。'],
['reconcile','/ˈrekənsaɪl/','動詞','両立させる、和解させる','It is hard to reconcile these two views.','この2つの見解を両立させるのは困難です。'],
['versatile','/ˈvɜːrsətl/','形容詞','多才な、多用途の','This is a versatile tool for designers.','これはデザイナー向けの多用途な道具です。'],
['withstand','/wɪðˈstænd/','動詞','耐える','The bridge can withstand strong winds.','その橋は強風に耐えられます。'],
['abundant','/əˈbʌndənt/','形容詞','豊富な','The island has abundant natural resources.','その島は天然資源が豊富です。'],
['consecutive','/kənˈsekjətɪv/','形容詞','連続した','Sales rose for three consecutive months.','売上は3か月連続で増加しました。'],
['elaborate','/ɪˈlæbərət/','形容詞','精巧な、入念な','They developed an elaborate plan.','彼らは入念な計画を立てました。'],
['fluctuate','/ˈflʌktʃueɪt/','動詞','変動する','Prices fluctuate throughout the year.','価格は年間を通して変動します。'],
['implication','/ˌɪmplɪˈkeɪʃən/','名詞','影響、含意','We considered the implications of the decision.','私たちはその決定が及ぼす影響を検討しました。'],
['legitimate','/lɪˈdʒɪtɪmət/','形容詞','正当な、合法的な','They raised legitimate concerns.','彼らはもっともな懸念を示しました。'],
['meticulous','/məˈtɪkjələs/','形容詞','細心の、几帳面な','The work requires meticulous attention.','その仕事には細心の注意が必要です。'],
['obstacle','/ˈɑːbstəkl/','名詞','障害','They overcame every obstacle.','彼らはあらゆる障害を乗り越えました。'],
['preserve','/prɪˈzɜːrv/','動詞','保護する、保存する','We must preserve this historic building.','この歴史的建造物を保存しなければなりません。'],
['skeptical','/ˈskeptɪkl/','形容詞','懐疑的な','She remained skeptical about the claim.','彼女はその主張に懐疑的なままでした。']
];
// Additional high-frequency academic, social, scientific, and civic vocabulary.
// Each entry is word|Japanese meaning|part of speech. These are original study
// entries, not an official Eiken list. New words use the device's English TTS.
const pre1Extra = `
abolish|廃止する|動詞
absorb|吸収する|動詞
abuse|乱用する、虐待する|動詞
accommodate|収容する、適応させる|動詞
accumulate|蓄積する|動詞
accurate|正確な|形容詞
acknowledge|認める|動詞
acquire|習得する、獲得する|動詞
adapt|適応する、改変する|動詞
adequate|十分な、適切な|形容詞
adjacent|隣接した|形容詞
adjust|調整する|動詞
administer|管理する、施行する|動詞
adolescent|思春期の若者|名詞
adopt|採用する、養子にする|動詞
adverse|不利な、有害な|形容詞
affair|事柄、情勢|名詞
affection|愛情|名詞
agenda|議題、予定|名詞
agriculture|農業|名詞
alert|警戒している|形容詞
alter|変更する|動詞
amend|修正する|動詞
ample|豊富な、十分な|形容詞
ancestor|祖先|名詞
annual|毎年の|形容詞
anticipate|予想する、期待する|動詞
anxiety|不安|名詞
apparent|明らかな|形容詞
appeal|訴える、魅力|名詞
appliance|電化製品|名詞
apprehend|理解する、逮捕する|動詞
appropriate|適切な|形容詞
approve|承認する|動詞
arbitrary|恣意的な、任意の|形容詞
architecture|建築、建築様式|名詞
arise|生じる|動詞
aspire|熱望する|動詞
assess|評価する|動詞
asset|資産、強み|名詞
assign|割り当てる|動詞
assume|推測する、引き受ける|動詞
assure|保証する、安心させる|動詞
astonish|驚かせる|動詞
attain|達成する|動詞
attribute|原因と考える、特性|名詞
authentic|本物の、信頼できる|形容詞
automate|自動化する|動詞
authorize|許可する|動詞
autonomy|自律、自主性|名詞
ban|禁止する|動詞
barrier|障壁|名詞
behalf|代理、支持|名詞
bizarre|奇妙な|形容詞
blame|非難する、責任|名詞
bond|結びつき、債券|名詞
boost|高める、後押し|動詞
boundary|境界|名詞
brief|簡潔な、短時間の|形容詞
budget|予算|名詞
bulk|大部分、かさ|名詞
burden|負担|名詞
calculate|計算する|動詞
capacity|能力、収容力|名詞
capture|捕らえる、捉える|動詞
career|職業、経歴|名詞
cease|やめる、終わる|動詞
ceremony|式典|名詞
challenge|課題、異議を唱える|名詞
chaos|混乱|名詞
charity|慈善、慈善団体|名詞
chronic|慢性的な|形容詞
circumstance|状況、事情|名詞
civil|市民の、民間の|形容詞
clarify|明確にする|動詞
classify|分類する|動詞
climate|気候、風潮|名詞
collapse|崩壊する、崩壊|名詞
colleague|同僚|名詞
commerce|商業|名詞
commission|委員会、手数料|名詞
commit|犯す、委ねる|動詞
commodity|商品、日用品|名詞
communicate|伝達する|動詞
community|地域社会、共同体|名詞
compatible|両立できる、互換性のある|形容詞
compensate|補償する|動詞
competent|有能な|形容詞
complex|複雑な、複合施設|名詞
comply|従う|動詞
component|構成要素|名詞
comprehensive|包括的な|形容詞
comprise|構成する|動詞
compromise|妥協する、妥協|名詞
conceal|隠す|動詞
concede|認める、譲歩する|動詞
concentrate|集中する|動詞
concept|概念|名詞
conduct|実施する、行動|名詞
confess|告白する|動詞
confine|制限する、閉じ込める|動詞
confirm|確認する|動詞
conflict|対立、衝突する|名詞
confront|直面する|動詞
conscious|意識している|形容詞
consensus|合意|名詞
consent|同意する、同意|名詞
conserve|保全する、節約する|動詞
considerable|かなりの|形容詞
consist|成り立つ|動詞
constant|一定の、絶え間ない|形容詞
constitute|構成する、制定する|動詞
consult|相談する、参照する|動詞
consume|消費する|動詞
contemporary|現代の、同時代の|形容詞
controversy|論争|名詞
conventional|従来の、慣習的な|形容詞
convert|変換する、改宗させる|動詞
convince|納得させる|動詞
cooperate|協力する|動詞
coordinate|調整する、調整役|動詞
cope|対処する|動詞
core|核心、中心的な|名詞
corporate|企業の|形容詞
correspond|一致する、文通する|動詞
credible|信頼できる|形容詞
criterion|基準|名詞
crucial|極めて重要な|形容詞
cultivate|耕す、育む|動詞
curb|抑制する、縁石|動詞
currency|通貨|名詞
current|現在の、流れ|名詞
custom|慣習、税関|名詞
debate|討論する、討論|名詞
decade|10年間|名詞
decline|減少する、断る|動詞
dedicate|ささげる|動詞
defect|欠陥、離反する|名詞
defend|守る、弁護する|動詞
deficiency|不足、欠乏|名詞
deliberate|熟考する、意図的な|動詞
democracy|民主主義|名詞
demonstrate|実証する、示す|動詞
denote|意味する、示す|動詞
deny|否定する、拒む|動詞
departure|出発、逸脱|名詞
derive|引き出す、由来する|動詞
deserve|値する|動詞
designate|指定する|動詞
desperate|必死の、絶望的な|形容詞
despite|にもかかわらず|前置詞
detect|発見する、検出する|動詞
devote|ささげる|動詞
diagnose|診断する|動詞
dictate|指示する、書き取らせる|動詞
dimension|側面、寸法|名詞
diplomat|外交官|名詞
disaster|災害、惨事|名詞
discipline|規律、分野|名詞
disclose|公表する|動詞
discount|割引、軽視する|名詞
discriminate|差別する、識別する|動詞
dispute|論争、異議を唱える|名詞
distinguish|区別する|動詞
distort|ゆがめる|動詞
distribute|配布する|動詞
diverse|多様な|形容詞
domain|領域、分野|名詞
domestic|国内の、家庭の|形容詞
dominate|支配する|動詞
draft|草案、下書きする|名詞
durable|耐久性のある|形容詞
economic|経済の|形容詞
eliminate|取り除く|動詞
emerge|現れる、明らかになる|動詞
emission|排出、放出|名詞
emphasize|強調する|動詞
enable|可能にする|動詞
encounter|遭遇する、遭遇|名詞
enforce|施行する、強制する|動詞
enhance|高める、向上させる|動詞
enormous|莫大な|形容詞
ensure|確実にする|動詞
enterprise|企業、事業|名詞
enthusiasm|熱意|名詞
entire|全体の|形容詞
entity|実体、組織|名詞
epidemic|流行病、蔓延|名詞
equivalent|同等のもの、同等の|名詞
erode|侵食する、徐々に損なう|動詞
establish|設立する、確立する|動詞
estimate|推定する、見積もり|名詞
ethic|倫理、道徳規範|名詞
evaluate|評価する|動詞
evident|明白な|形容詞
evolve|進化する、発展する|動詞
exaggerate|誇張する|動詞
exceed|超える|動詞
exclude|除外する|動詞
execute|実行する、処刑する|動詞
exhibit|展示する、展示品|動詞
expand|拡大する|動詞
expertise|専門知識|名詞
explicit|明白な、明示的な|形容詞
exploit|利用する、搾取する|動詞
expose|さらす、暴露する|動詞
external|外部の|形容詞
extract|取り出す、抽出物|動詞
facilitate|促進する、容易にする|動詞
factor|要因、因数|名詞
federal|連邦の|形容詞
finance|資金を供給する、財政|動詞
flexible|柔軟な|形容詞
focus|焦点を合わせる、焦点|名詞
formal|正式な、形式的な|形容詞
former|前の、前者|形容詞
formula|公式、処方|名詞
foundation|基礎、財団|名詞
framework|枠組み|名詞
frequent|頻繁な|形容詞
fundamental|基本的な、根本的な|形容詞
function|機能する、機能|名詞
fund|資金を提供する、基金|動詞
generate|生み出す、発電する|動詞
generation|世代、発生|名詞
genuine|本物の、誠実な|形容詞
global|世界的な|形容詞
gradual|徐々の|形容詞
grant|与える、助成金|動詞
guarantee|保証する、保証|名詞
guideline|指針、ガイドライン|名詞
 habitat|生息地|名詞
harass|嫌がらせをする|動詞
hazard|危険、危険要因|名詞
highlight|強調する、見どころ|動詞
hierarchy|階層、序列|名詞
hostile|敵意のある|形容詞
household|世帯、家庭|名詞
humble|謙虚な、質素な|形容詞
identify|特定する、同一視する|動詞
ignore|無視する|動詞
illustrate|説明する、例示する|動詞
image|イメージ、画像|名詞
immigrate|移住する（入国する）|動詞
implement|実行する、実施する|動詞
incentive|動機、奨励策|名詞
incidence|発生率、発生|名詞
incorporate|取り入れる、法人化する|動詞
indicate|示す|動詞
individual|個人、個々の|名詞
inefficient|非効率な|形容詞
inequality|不平等|名詞
infect|感染させる|動詞
infrastructure|社会基盤、インフラ|名詞
initial|最初の、頭文字|形容詞
initiative|主導権、新構想|名詞
innovate|革新する|動詞
innovation|革新、技術革新|名詞
input|入力、意見|名詞
insight|洞察、見識|名詞
inspect|検査する|動詞
instance|例、実例|名詞
institute|設立する、研究所|動詞
institution|機関、制度|名詞
integrate|統合する|動詞
integrity|誠実さ、完全性|名詞
intense|強烈な、激しい|形容詞
interact|相互に作用する|動詞
internal|内部の、国内の|形容詞
interpret|解釈する、通訳する|動詞
interrupt|妨げる、中断する|動詞
interval|間隔、合間|名詞
intervene|介入する|動詞
intimate|親密な、詳しい|形容詞
invest|投資する|動詞
investigate|調査する|動詞
investment|投資|名詞
involve|伴う、巻き込む|動詞
isolate|隔離する、孤立させる|動詞
issue|問題、発行する|名詞
justify|正当化する|動詞
label|ラベル、分類する|名詞
labor|労働、労働する|名詞
launch|開始する、打ち上げる|動詞
layer|層、重ねる|名詞
lecture|講義、講義する|名詞
liberal|自由主義の、寛大な|形容詞
license|免許、許可する|名詞
link|関連づける、つながり|動詞
locate|位置を特定する、置く|動詞
logic|論理|名詞
maintain|維持する、主張する|動詞
majority|大多数|名詞
manual|手引書、手作業の|名詞
margin|余白、差|名詞
massive|巨大な、大規模な|形容詞
mechanism|仕組み、機構|名詞
mediate|仲裁する、媒介する|動詞
method|方法|名詞
military|軍隊、軍事の|名詞
minimal|最小限の|形容詞
minority|少数派|名詞
mode|方式、様式|名詞
modify|修正する|動詞
monitor|監視する、モニター|動詞
motivate|動機づける|動詞
mutual|相互の、共通の|形容詞
negate|否定する、無効にする|動詞
negative|否定的な、負の|形容詞
negotiate|交渉する|動詞
network|ネットワーク、網|名詞
neutral|中立の|形容詞
nevertheless|それにもかかわらず|副詞
norm|規範、標準|名詞
notion|考え、概念|名詞
objective|目的、客観的な|名詞
obtain|得る、獲得する|動詞
occupy|占める、占領する|動詞
occur|起こる、生じる|動詞
odd|奇妙な、奇数の|形容詞
ongoing|進行中の|形容詞
operate|操作する、運営する|動詞
opponent|対戦相手、反対者|名詞
opportunity|機会|名詞
option|選択肢|名詞
orient|方向づける、適応させる|動詞
outcome|結果|名詞
overall|全体的な、全体として|形容詞
overlap|重なる、重複|動詞
overseas|海外へ、海外の|副詞
participate|参加する|動詞
passive|受動的な|形容詞
perceive|認識する、知覚する|動詞
period|期間、時代|名詞
persist|持続する、固執する|動詞
perspective|観点、見方|名詞
phase|段階、局面|名詞
phenomenon|現象|名詞
policy|政策、方針|名詞
portion|一部、分け前|名詞
pose|提起する、姿勢|動詞
positive|肯定的な、積極的な|形容詞
potential|可能性、潜在的な|名詞
practical|実用的な、現実的な|形容詞
precise|正確な、精密な|形容詞
predict|予測する|動詞
principle|原則、主義|名詞
priority|優先事項、優先権|名詞
procedure|手続き、手順|名詞
process|処理する、過程|名詞
professional|専門家、専門的な|名詞
prohibit|禁止する|動詞
promote|促進する、昇進させる|動詞
proportion|割合、釣り合い|名詞
prospect|見込み、展望|名詞
protocol|規約、手順|名詞
psychology|心理学、心理|名詞
publication|出版、刊行物|名詞
purchase|購入する、購入|名詞
pursue|追求する、続ける|動詞
qualify|資格を得る、限定する|動詞
quote|引用する、引用|動詞
radical|根本的な、急進的な|形容詞
range|範囲、及ぶ|名詞
ratio|比率|名詞
react|反応する|動詞
recover|回復する、取り戻す|動詞
refine|改良する、精製する|動詞
regime|政権、体制|名詞
region|地域、地方|名詞
regulate|規制する、調整する|動詞
reinforce|強化する、補強する|動詞
reject|拒絶する、却下する|動詞
release|解放する、発表する|動詞
relevant|関連のある、適切な|形容詞
relief|安心、救済|名詞
rely|頼る、当てにする|動詞
remark|述べる、発言|動詞
remote|遠隔の、へんぴな|形容詞
remove|取り除く、移動させる|動詞
render|ある状態にする、提供する|動詞
renew|更新する、再開する|動詞
replace|取って代わる、交換する|動詞
represent|表す、代表する|動詞
reputation|評判、名声|名詞
request|依頼する、依頼|名詞
requirement|必要条件、要件|名詞
research|研究、調査する|名詞
resolve|解決する、決意する|動詞
resource|資源、手段|名詞
respond|応答する、反応する|動詞
restore|回復する、修復する|動詞
restrict|制限する|動詞
retain|保持する、覚えている|動詞
reveal|明らかにする|動詞
revenue|収益、歳入|名詞
reverse|逆にする、逆|動詞
revise|改訂する、修正する|動詞
revolution|革命、大変革|名詞
rigid|硬直した、厳格な|形容詞
role|役割、役|名詞
route|道筋、経路|名詞
routine|日課、決まりきった|名詞
scheme|計画、制度|名詞
scope|範囲、余地|名詞
sector|部門、分野|名詞
secure|確保する、安全な|動詞
sequence|順序、連続|名詞
shift|移す、変化|動詞
significant|重要な、かなりの|形容詞
similar|似ている|形容詞
simulate|模擬実験する、装う|動詞
site|場所、用地|名詞
somewhat|いくぶん、多少|副詞
source|源、情報源|名詞
specific|特定の、具体的な|形容詞
specify|明記する、指定する|動詞
stable|安定した|形容詞
standard|基準、標準的な|名詞
status|地位、状況|名詞
strategy|戦略、計画|名詞
stress|強調する、ストレス|名詞
structure|構造、構成する|名詞
submit|提出する、従う|動詞
subsequent|その後の、後続の|形容詞
subsidy|補助金、助成金|名詞
substitute|代用する、代用品|動詞
sufficient|十分な|形容詞
sum|合計、要約する|名詞
survey|調査、調査する|名詞
sustain|維持する、支える|動詞
symbol|象徴、記号|名詞
symbolize|象徴する|動詞
target|目標、対象とする|名詞
task|任務、課題|名詞
technical|技術的な、専門的な|形容詞
technique|技術、手法|名詞
technology|技術、テクノロジー|名詞
temporary|一時的な|形容詞
theory|理論、学説|名詞
thereby|それによって|副詞
threat|脅威、恐れ|名詞
thrive|繁栄する、うまく育つ|動詞
topic|話題、主題|名詞
tradition|伝統、慣習|名詞
transfer|移す、転送|動詞
transform|変える、変形させる|動詞
transition|移行、変遷|名詞
transmit|送る、伝染させる|動詞
transport|輸送する、交通機関|動詞
trend|傾向、流行|名詞
trigger|引き起こす、引き金|動詞
ultimate|究極の、最終的な|形容詞
undergo|経験する、受ける|動詞
undertake|引き受ける、着手する|動詞
uniform|制服、均一な|名詞
unique|独特の、唯一の|形容詞
universal|普遍的な、全世界の|形容詞
urban|都市の|形容詞
utilize|利用する|動詞
valid|妥当な、有効な|形容詞
vary|変わる、変える|動詞
vehicle|乗り物、伝達手段|名詞
version|版、解釈|名詞
via|を経由して、によって|前置詞
violate|侵害する、違反する|動詞
virtual|仮想の、事実上の|形容詞
visible|目に見える、明らかな|形容詞
vision|展望、視力|名詞
voluntary|自発的な、任意の|形容詞
volume|量、巻、音量|名詞
welfare|福祉、福利|名詞
whereas|一方で、であるのに対し|接続詞
whereby|それによって|副詞
widespread|広く普及した|形容詞
withdraw|引き出す、撤回する|動詞
yield|生み出す、譲る|動詞
`.trim().split('\n').map(line=>line.trim()).filter(Boolean).map(line=>line.split('|'));
const existingPre1=new Set(pre1.map(w=>w[0]));
const extraWords=pre1Extra.filter(([word])=>!existingPre1.has(word)).slice(0,460);
const pre1All=[...pre1,...extraWords.map(([word,meaning,pos])=>[
  word,pre1Details[word]?.ipa||'—',pre1Details[word]?.pos||pos,pre1Details[word]?.meaning||meaning,
  pre1Details[word]?.example||`The word “${word}” appeared in the article.`,
  pre1Details[word]?.translation||`記事に「${word}」（${meaning}）という単語が出てきました。`
])];
export const words=[...basic.map((w,i)=>({id:'b'+i,deck:'basic',word:w[0],ipa:w[1],pos:w[2],meaning:w[3],example:w[4],translation:w[5]})),...pre1All.map((w,i)=>({id:'p'+i,deck:'pre1',word:w[0],ipa:w[1],pos:w[2],meaning:w[3],example:w[4],translation:w[5]}))];
export const decks={basic:{title:'日常英単語',label:'BASIC ENGLISH',description:'毎日に使える、英語の土台を。',color:'green'},pre1:{title:'英検® 準1級',label:'EIKEN PRE-1',description:'ひとつ上の語彙力へ、一歩ずつ。',color:'purple'}};
