'use strict';
// Мир вокруг Думы: регионы, законопроекты, президентские выборы.
// Всё здесь — приблизительная редакционная модель: типы регионов и привязка черт к законам заданы вручную.

// ══════ Регионы ══════
// Типы регионов: [название, что важно региону и как он голосовал, черты с весом (минус — отталкивает), годы действия]
const REG_T={
  cap:['Capital metropolis','Press freedom, fair elections, an open economy. Moscow and St Petersburg gave “Yabloko” and the right their best results in the country.',{lib:1,plural:1,mkt:.7,west:.7,prog:.5,privacy:.5},1993,2026],
  big:['Industrial centre','Wages, factory orders, tariffs. Votes close to the national average.',{labor:.8,gos:.5,welfare:.5,biz:.4,tech:.3},1993,2026],
  cen:['Central Russia','Jobs, roads, people leaving for Moscow.',{welfare:.5,labor:.5,trad:.3,stab:.3},1993,2026],
  red:['Red Belt','Soviet-era guarantees, the countryside, distrust of reforms. In 1995–1999 the CPRF won here comfortably.',{soviet:1,welfare:.8,gos:.8,agr:.6,nat:.5,antiwest:.4},1993,2003],
  agr:['Agrarian region','Support for agriculture, grain and fuel prices.',{agr:1,prot:.7,trad:.5,welfare:.4},1993,2026],
  nat:['National republic','The status of the republic, the native language, deals with the centre. Since the 2000s the party of power has scored far above average here.',{stab:1,pres:.8,multi:.7,fed:.5,lang_min:.6,trad:.5,rel:.4,lang_one:-.8,nation:-.6},1993,2026],
  cau:['North Caucasus','Security, subsidies, a traditional way of life. Since the 2000s it has had the country’s highest turnout and support for the authorities.',{stab:1,pres:1,trad:.8,rel:.8,unity:.5,lang_one:-.6,nation:-.6},1993,2026],
  res:['Resource-rich North','Oil and gas, northern pay supplements, the dispute over how much tax stays in the region.',{growth:.8,stab:.6,fed:.5,welfare:.4,tax_lo:.4,nat:.3},1993,2026],
  far:['Far East','Distance from Moscow, prices, people leaving. The protest vote is strong here: the LDPR won in 1993, and its governors won in 2018–2019.',{pop:1,prot:.6,nation:.5,fed:.5,plural:.4,welfare:.4,stab:-.4},1993,2026],
  sib:['Siberia','Tariffs, the environment, independence from the centre.',{fed:.6,pop:.5,labor:.5,eco:.4,plural:.3},1993,2026],
  north:['Russian North and North-West','Timber, ports, people leaving. A noticeable protest vote.',{plural:.5,eco:.5,welfare:.5,pop:.4,west:.2},1993,2026],
  mil:['Defence-industry region','Defence orders, the army, great-power status.',{mil:1,gos:.5,sov:.5,nation:.4},1993,2026],
  border:['Southern borderland','Migration, the Cossacks, a demand for order.',{imm_anti:.8,law:.7,nation:.6,trad:.5,agr:.4},1993,2026],
  loyal:['Stronghold of the party of power','Stability and federal money. Since 2003 “United Russia” has scored noticeably above average here.',{stab:1,pres:.8,cent:.4,growth:.3},2003,2026],
  lib90:['Region of 1990s reformers','Their own reformist governors, privatisation, investors: Nemtsov’s Nizhny Novgorod, Titov’s Samara, Rossel’s Urals.',{mkt:.8,priv:.6,biz:.6,west:.4,plural:.4},1993,1999],
  protest:['Protest region of the 2010s','Discontent with Moscow and its appointees. In 2018–2021 CPRF and LDPR candidates won here.',{pop:.7,plural:.6,fed:.5,welfare:.5,stab:-.6},2011,2026],
  ex:['Exclave','A border with the European Union, trade, the navy.',{west:.6,mkt:.5,biz:.4,mil:.3},1993,2026]
};
// Регионы: код: [название, типы]. Крым и Севастополь участвуют только в сценариях с 2016 года, четыре региона 2022 года — с 2026 года.
const REG={
  MOW:['Moscow',['cap']],SPE:['St Petersburg',['cap']],MOS:['Moscow Oblast',['big']],LEN:['Leningrad Oblast',['north']],
  BEL:['Belgorod Oblast',['red','agr','loyal']],BRY:['Bryansk Oblast',['red','agr']],VLA:['Vladimir Oblast',['big','protest']],VOR:['Voronezh Oblast',['red','agr']],
  IVA:['Ivanovo Oblast',['big']],KLU:['Kaluga Oblast',['big']],KOS:['Kostroma Oblast',['cen']],KRS:['Kursk Oblast',['red','agr']],LIP:['Lipetsk Oblast',['red','agr']],
  ORL:['Oryol Oblast',['red','agr']],RYA:['Ryazan Oblast',['red','cen']],SMO:['Smolensk Oblast',['red','cen']],TAM:['Tambov Oblast',['red','agr','loyal']],
  TVE:['Tver Oblast',['cen']],TUL:['Tula Oblast',['red','mil']],YAR:['Yaroslavl Oblast',['cen','protest']],
  KR:['Karelia',['north','protest']],KO:['Komi',['north','res','protest']],ARK:['Arkhangelsk Oblast',['north','protest']],NEN:['Nenets Autonomous Okrug',['res']],
  VLG:['Vologda Oblast',['north']],KGD:['Kaliningrad Oblast',['ex']],MUR:['Murmansk Oblast',['north','mil']],NGR:['Novgorod Oblast',['north']],PSK:['Pskov Oblast',['north']],
  AD:['Adygea',['nat','agr','red']],KL:['Kalmykia',['nat','agr']],KDA:['Krasnodar Krai',['agr','border','red','loyal']],AST:['Astrakhan Oblast',['border']],
  VGG:['Volgograd Oblast',['red','agr']],ROS:['Rostov Oblast',['agr','border']],
  DA:['Dagestan',['cau','red']],IN:['Ingushetia',['cau']],KB:['Kabardino-Balkaria',['cau']],KC:['Karachay-Cherkessia',['cau','red']],SE:['North Ossetia',['cau','red']],CE:['Chechnya',['cau']],
  STA:['Stavropol Krai',['agr','border','red']],
  BA:['Bashkortostan',['nat','res','loyal']],ME:['Mari El',['nat','red','protest']],MO:['Mordovia',['nat','red','loyal']],TA:['Tatarstan',['nat','res','loyal']],UD:['Udmurtia',['nat','mil']],
  CU:['Chuvashia',['nat','red']],PER:['Perm Krai',['big','lib90']],KIR:['Kirov Oblast',['cen','protest']],NIZ:['Nizhny Novgorod Oblast',['big','lib90']],ORE:['Orenburg Oblast',['agr','red']],
  PNZ:['Penza Oblast',['red','agr']],SAM:['Samara Oblast',['big','lib90']],SAR:['Saratov Oblast',['agr','red','loyal']],ULY:['Ulyanovsk Oblast',['red','protest']],
  KGN:['Kurgan Oblast',['agr','red']],SVE:['Sverdlovsk Oblast',['big','lib90','mil']],TYU:['Tyumen Oblast',['res','loyal']],KHM:['Khanty-Mansi Autonomous Okrug',['res']],
  YAN:['Yamalo-Nenets Autonomous Okrug',['res','loyal']],CHE:['Chelyabinsk Oblast',['big','mil']],
  AL:['Altai Republic',['nat','sib','protest']],ALT:['Altai Krai',['agr','red','sib']],BU:['Buryatia',['nat','sib']],ZAB:['Zabaykalsky Krai',['sib','red','far']],
  IRK:['Irkutsk Oblast',['sib','big','protest']],KEM:['Kemerovo Oblast',['big','sib','loyal']],KYA:['Krasnoyarsk Krai',['sib','big','res']],NVS:['Novosibirsk Oblast',['sib','big','red','protest']],
  OMS:['Omsk Oblast',['sib','big','red','protest']],TOM:['Tomsk Oblast',['sib','lib90']],TY:['Tuva',['nat','loyal']],KK:['Khakassia',['sib','protest']],
  SA:['Yakutia',['nat','res','far','protest']],KAM:['Kamchatka Krai',['far']],PRI:['Primorsky Krai',['far','protest']],KHA:['Khabarovsk Krai',['far','protest']],AMU:['Amur Oblast',['far','red']],
  MAG:['Magadan Oblast',['far']],SAK:['Sakhalin Oblast',['far','res']],YEV:['Jewish Autonomous Oblast',['far']],CHU:['Chukotka',['far','res','loyal']],
  CR:['Crimea',['border','loyal','mil']],SEV:['Sevastopol',['mil','loyal']],
  // регионы, включённые в состав России в 2022 году: на карте только с выборов 2026 года
  DON:['Donetsk People’s Republic',['big','mil','loyal']],LUG:['Luhansk People’s Republic',['big','mil','loyal']],ZAP:['Zaporozhye Oblast',['agr','mil','loyal']],KHE:['Kherson Oblast',['agr','border','loyal']]
};

// ══════ Законопроекты по созывам ══════
// Год сценария: [название, суть, черты “за”, черты “против”, тип ('law' — простое большинство, 'const' — две трети), как было на самом деле]
const BILLS={
  1993:[
    ['Amnesty for participants in the events of 1991 and 1993','A resolution granting amnesty to members of the 1991 coup committee and the defenders of the Supreme Soviet.',['soviet','parl','nation','stab'],['west','priv'],'law','Adopted in February 1994.'],
    ['Civil Code, Part One','Enshrines private property and freedom of contract.',['mkt','priv','biz'],['soviet','nat'],'law','Adopted in October 1994.'],
    ['Vote of no confidence in the Chernomyrdin government','A vote held after the hospital hostage-taking in Budyonnovsk.',['parl','soviet','nation','pop'],['pres','stab'],'law','In June 1995 it won a majority; in the repeat vote in July it did not.'],
    ['Production sharing agreements','Admits foreign investors to natural resource development on special terms.',['mkt','west','biz'],['sov','nat','prot'],'law','Adopted in December 1995.'],
    ['Indexation of Sberbank deposits','The state recognises devalued deposits as its domestic debt.',['welfare','soviet','pop'],['self','mkt'],'law','The law on restoring savings was adopted in 1995.']
  ],
  1995:[
    ['Denunciation of the Belovezha Accords','The Duma declares the decision to dissolve the USSR invalid.',['soviet','eurasia'],['west','pres','mkt'],'law','The resolution was adopted in March 1996.'],
    ['Impeachment of President Yeltsin','Five charges, including the Belovezha Accords and the war in Chechnya.',['parl','soviet'],['pres','stab'],'const','In May 1999 none of the charges won 300 votes.'],
    ['Confirmation of Sergei Kiriyenko as prime minister','The president nominates the same candidate three times, threatening to dissolve the Duma.',['pres','mkt','stab'],['parl','soviet'],'law','Confirmed on the third attempt in April 1998.'],
    ['Land Code with free sale of land','Allows the sale and purchase of farmland.',['mkt','priv'],['agr','gos','soviet'],'law','The second Duma adopted a code without land sales; the president vetoed it.'],
    ['Ratification of the START II treaty','Reduction of strategic nuclear arms together with the USA.',['west','pac'],['mil','antiwest'],'law','The second Duma did not ratify the treaty.'],
    ['Law on freedom of conscience','A special role for Orthodoxy and restrictions on new religious organisations.',['rel','trad','nation'],['sec','lib'],'law','Adopted in September 1997.']
  ],
  1999:[
    ['Ratification of the START II treaty','Reduction of strategic nuclear arms together with the USA.',['west','pac','stab'],['antiwest','soviet'],'law','Ratified in April 2000.'],
    ['Flat income tax','A single 13% rate instead of a progressive scale.',['tax_lo','mkt','biz'],['tax_hi','equal'],'law','Adopted in 2000.'],
    ['Anthem to Alexandrov’s music','The return of the Soviet anthem’s melody with new lyrics.',['soviet','nation','stab','trad'],['lib','west'],'law','Adopted in December 2000.'],
    ['Land Code','Allows the sale of land other than farmland.',['mkt','priv','stab'],['agr','soviet'],'law','Adopted in 2001.'],
    ['New Labour Code','Makes dismissal and fixed-term contracts easier and reduces trade union rights.',['biz','mkt','stab'],['labor','soviet'],'law','Adopted in December 2001.'],
    ['Reform of the Federation Council','Governors and regional speakers leave the senate and are replaced by appointed representatives.',['cent','pres','stab'],['fed'],'law','Adopted in 2000.']
  ],
  2003:[
    ['Monetisation of benefits','Replacing free transport and medicines with cash payments.',['mkt','choice','stab'],['welfare','soviet','labor'],'law','Adopted in August 2004; in January 2005 pensioners protested across the country.'],
    ['Abolition of direct gubernatorial elections','Regional heads are confirmed on the president’s nomination.',['cent','stab','pres'],['plural','fed','direct'],'law','Adopted in December 2004.'],
    ['Duma elections by party lists only','Single-member districts are abolished and the threshold rises to 7%.',['stab','cent'],['plural','parl'],'law','Adopted in 2005.'],
    ['Abolition of the “against all” option','The option to vote against all candidates is removed from ballots.',['stab'],['direct','plural','pop'],'law','Adopted in 2006.'],
    ['Control over non-profit organisations','Broadens the grounds for inspecting NGOs and refusing them registration.',['sov','auth','stab'],['lib','plural','west'],'law','Adopted in December 2005.'],
    ['Maternity capital','A payment to families for a second child.',['welfare','trad','gos'],['self','mkt'],'law','Adopted in December 2006.']
  ],
  2007:[
    ['Six-year presidential term','Constitutional amendments: the president is elected for six years, the Duma for five.',['stab','pres'],['plural','parl'],'const','Adopted in November 2008; the CPRF voted against.'],
    ['Recognition of Abkhazia and South Ossetia','An appeal to the president after the war of August 2008.',['nation','sov','antiwest','mil','eurasia'],['west','cosmo'],'law','Adopted unanimously in August 2008.'],
    ['Crisis aid for banks and state companies','An anti-crisis package: loans to banks and share buy-outs funded from the reserves.',['gos','stab','nat'],['self','mkt'],'law','Adopted in October 2008.'],
    ['Law “On the Police”','The militia is renamed the police and its powers change.',['law','stab','tech'],['soviet','plural'],'law','Adopted in January 2011; the CPRF voted against.'],
    ['Ratification of the New START treaty','A new treaty with the USA on reducing nuclear arms.',['west','pac','stab'],['antiwest','mil'],'law','Ratified in January 2011.']
  ],
  2011:[
    ['Fines for violations at rallies','Fines for participants and organisers of rallies rise dozens of times over.',['auth','stab','law'],['lib','plural'],'law','Adopted in June 2012 after many hours of obstruction by the opposition.'],
    ['The “foreign agents” law','NGOs with foreign funding must register in a special registry.',['sov','auth','antiwest'],['lib','plural','west'],'law','Adopted in July 2012.'],
    ['The “Dima Yakovlev law”','A ban on US citizens adopting Russian children.',['antiwest','sov','nation'],['west','lib','cosmo'],'law','Adopted in December 2012.'],
    ['Treaty on the accession of Crimea','A federal constitutional law on the new constituent territories.',['nation','sov','antiwest','unity'],['west','cosmo'],'const','Adopted in March 2014: 443 for, 1 against.'],
    ['Return of single-member districts','Half of the Duma is again elected in districts.',['direct','fed','stab'],['parl'],'law','Adopted in February 2014.'],
    ['The “Yarovaya package”','Operators must store calls and messages; new anti-terrorism offences.',['auth','law','sov'],['privacy','lib','biz'],'law','Adopted in June 2016.']
  ],
  2016:[
    ['Raising the retirement age','To 65 for men and 60 for women.',['self','stab'],['welfare','labor','soviet','pop'],'law','Adopted in September 2018; the CPRF, the LDPR and “A Just Russia” voted against.'],
    ['Raising VAT to 20%','The value-added tax rate rises from 18 to 20 per cent.',['stab'],['tax_lo','biz','pop'],'law','Adopted in July 2018.'],
    ['The “sovereign internet” law','The state gains the right to manage internet traffic centrally.',['auth','stab'],['lib','privacy','plural','tech'],'law','Adopted in April 2019.'],
    ['The 2020 constitutional amendments','Resetting presidential terms; priority of the Constitution over international law.',['stab','pres','trad','sov'],['plural','parl'],'const','Adopted in March 2020: 383 for, none against, 43 abstained.'],
    ['Penalties for “disrespect for the authorities”','Fines and blocking for insulting the state online and for fake news.',['auth','stab','law'],['lib','plural','privacy'],'law','Adopted in March 2019.'],
    ['15% income tax rate on high incomes','A higher rate on incomes above 5 million roubles a year.',['tax_hi','equal','welfare'],['tax_lo','biz'],'law','Adopted in November 2020.']
  ],
  2021:[
    ['Unified system of public authority','Standardises regional government bodies and lifts term limits for governors.',['cent','stab','pres'],['fed','plural','lang_min'],'law','Adopted in December 2021; the CPRF voted against.'],
    ['QR codes in public places','Access to cafes, shops and transport with a vaccination certificate.',['auth','tech','stab'],['lib','pop','privacy'],'law','Passed its first reading in December 2021; withdrawn in January 2022.'],
    ['Appeal to recognise the DPR and LPR','The Duma asks the president to recognise the independence of the two republics.',['nation','sov','antiwest','eurasia'],['west','cosmo','pac'],'law','Adopted in February 2022.'],
    ['Ban on “propaganda of non-traditional relationships”','The ban covers advertising, films, books and the internet for all ages.',['trad','rel','auth'],['lib','privacy','prog'],'law','Adopted unanimously in November 2022.'],
    ['Nationwide electronic voting','Uniform rules for remote voting in elections at all levels.',['tech','stab'],['plural'],'law','Adopted in March 2022.'],
    ['Pension indexation for working pensioners','The return of indexation frozen in 2016.',['welfare','labor'],['self','stab'],'law','Opposition bills were rejected; indexation was brought back by a 2024 law.']
  ],
  x2026:[
    ['Amnesty for those convicted on political charges','Release of those convicted for statements, protests and membership of banned organisations.',['lib','plural','rehab'],['auth','law','stab'],'law','There has been no such amnesty. In the prisoner exchange of August 2024 Russia released 16 people.'],
    ['Repeal of the foreign agent laws','The register of foreign agents is abolished and the restrictions are lifted.',['lib','plural','west'],['sov','auth'],'law','The law has been in force since 2012 and has been tightened many times.'],
    ['Constitutional amendment: the Duma forms the government','The prime minister and ministers are appointed by the parliamentary majority; presidential powers are reduced.',['parl','plural'],['pres','stab'],'const','Under the 2020 amendments the Duma approves the prime minister and some ministers, but the decisive powers remain with the president.'],
    ['Ratification of a peace agreement','A treaty ending the fighting in Ukraine, reached through mutual concessions.',['pac','west','cosmo'],['mil','nation','antiwest'],'law','The scenario is fictional: no such vote has taken place in the Duma.'],
    ['Return of direct mayoral elections and abolition of the municipal filter','City heads are elected by residents; candidates for governor no longer need councillors’ signatures.',['plural','fed','direct'],['cent','stab'],'law','The municipal filter has been in force since 2012; the 2025 law on local self-government allowed regions to abolish the settlement tier.'],
    ['Cut in military spending','Part of the defence budget is redirected to healthcare, education and roads.',['pac','welfare','pub'],['mil','sov'],'law','The 2025 budget allocates about 13.5 trillion roubles to defence — almost a third of all spending.'],
    ['Repeal of the “sovereign internet”','Blocks on foreign services are lifted and traffic-filtering equipment is switched off.',['lib','privacy'],['auth','sov'],'law','The “sovereign internet” law has been in force since 2019; YouTube began to be throttled in 2024.'],
    ['Visa regime with Central Asian countries','Entry for work only with a visa and an employer’s invitation.',['imm_anti','nation','law'],['imm_pro','eurasia','cosmo'],'law','Such bills were introduced but not passed; a register of controlled persons has operated since 2025.'],
    ['Review of the results of privatisation','Enterprises privatised unlawfully are returned to the state.',['nat','soviet','gos'],['priv','mkt','biz'],'law','There is no general law, but since 2022 courts acting on the Prosecutor General’s claims have handed dozens of large enterprises to the state.'],
    ['Reversal of the pension age increase','A return to retirement at 55 and 60.',['welfare','labor','pop'],['self','stab'],'law','The pension age has been rising since 2019; bills to reverse it were rejected.'],
    ['Law on vetting of officials','Judges, security officers and senior officials of the former leadership are vetted and, if they broke the law, barred from holding office.',['plural','lib'],['stab','unity','pres'],'law','No such law has been adopted in Russia.'],
    ['Special status for combat veterans','Quotas in universities, the civil service and party lists, plus lifelong payments.',['mil','nation','welfare'],['pac','equal'],'law','University quotas for participants and their children have applied since 2022, and the “Time of Heroes” personnel programme since 2024.']
  ]
};

// ══════ Президентские выборы после думских ══════
// Год сценария: {y — год выборов, c — кандидаты [имя, партия из сценария или null, свои черты или null], real — как было}
const PRES={
  1993:{y:1996,c:[['Boris Yeltsin',null,{pres:3,mkt:2,priv:2,west:2,stab:2,unity:2,plural:1,lib:1,biz:1}],['Gennady Zyuganov','CPRF',null],['Alexander Lebed',null,{law:3,unity:3,mil:2,nation:2,auth:2,pop:2,sov:2,mkt:1}],['Grigory Yavlinsky','Yabloko',null],['Vladimir Zhirinovsky','LDPR',null]],
    real:'First round: Yeltsin 35.3%, Zyuganov 32.0%, Lebed 14.5%, Yavlinsky 7.3%, Zhirinovsky 5.7%. Second round: Yeltsin 53.8%, Zyuganov 40.3%.'},
  1995:{y:1996,c:[['Boris Yeltsin',null,{pres:3,mkt:2,priv:2,west:2,stab:2,unity:2,plural:1,lib:1,biz:1}],['Gennady Zyuganov','CPRF',null],['Alexander Lebed',null,{law:3,unity:3,mil:2,nation:2,auth:2,pop:2,sov:2,mkt:1}],['Grigory Yavlinsky','Yabloko',null],['Vladimir Zhirinovsky','LDPR',null]],
    real:'First round: Yeltsin 35.3%, Zyuganov 32.0%, Lebed 14.5%, Yavlinsky 7.3%, Zhirinovsky 5.7%. Second round: Yeltsin 53.8%, Zyuganov 40.3%.'},
  1999:{y:2000,c:[['Vladimir Putin','Unity',null],['Gennady Zyuganov','CPRF',null],['Grigory Yavlinsky','Yabloko',null],['Aman Tuleyev',null,{gos:3,welfare:3,labor:2,nat:2,unity:2,stab:1,soviet:1}],['Vladimir Zhirinovsky','Zhirinovsky Bloc',null],['Konstantin Titov','Union of Right Forces',null]],
    real:'Putin 52.9%, Zyuganov 29.2%, Yavlinsky 5.8%, Tuleyev 2.95%, Zhirinovsky 2.7%, Titov 1.5%. Won in the first round.'},
  2003:{y:2004,c:[['Vladimir Putin','United Russia',null],['Nikolai Kharitonov','CPRF',null],['Sergei Glazyev','Rodina',null],['Irina Khakamada','Union of Right Forces',null],['Oleg Malyshkin','LDPR',null],['Sergei Mironov',null,{welfare:2,stab:2,gos:1,labor:1,pres:1}]],
    real:'Putin 71.3%, Kharitonov 13.7%, Glazyev 4.1%, Khakamada 3.8%, Malyshkin 2.0%, Mironov 0.75%.'},
  2007:{y:2008,c:[['Dmitry Medvedev','United Russia',null],['Gennady Zyuganov','CPRF',null],['Vladimir Zhirinovsky','LDPR',null],['Andrei Bogdanov',null,{west:2,euro:2,mkt:1,plural:1,lib:1}]],
    real:'Medvedev 70.3%, Zyuganov 17.7%, Zhirinovsky 9.3%, Bogdanov 1.3%.'},
  2011:{y:2012,c:[['Vladimir Putin','United Russia',null],['Gennady Zyuganov','CPRF',null],['Mikhail Prokhorov','Right Cause',null],['Vladimir Zhirinovsky','LDPR',null],['Sergei Mironov','A Just Russia',null]],
    real:'Putin 63.6%, Zyuganov 17.2%, Prokhorov 8.0%, Zhirinovsky 6.2%, Mironov 3.85%.'},
  2016:{y:2018,c:[['Vladimir Putin','United Russia',null],['Pavel Grudinin','CPRF',null],['Vladimir Zhirinovsky','LDPR',null],['Ksenia Sobchak',null,{lib:3,plural:3,west:3,prog:3,mkt:2,cosmo:2,privacy:2}],['Grigory Yavlinsky','Yabloko',null],['Boris Titov','Party of Growth',null],['Sergei Baburin',null,{nation:3,sov:3,antiwest:3,unity:3,soviet:2,gos:2}]],
    real:'Putin 76.7%, Grudinin 11.8%, Zhirinovsky 5.65%, Sobchak 1.68%, Yavlinsky 1.05%, Titov 0.76%, Baburin 0.65%.'},
  2021:{y:2024,c:[['Vladimir Putin','United Russia',null],['Nikolai Kharitonov','CPRF',null],['Vladislav Davankov','New People',null],['Leonid Slutsky','LDPR',null]],
    real:'Putin 87.3%, Kharitonov 4.3%, Davankov 3.85%, Slutsky 3.2%.'},
  x2026:{y:2026,c:[['Mikhail Mishustin','United Russia',{tech:3,stab:3,growth:3,pres:2,cent:2,gos:2,welfare:2,sov:2,unity:2,mkt:1,antiwest:1,law:1}],['Gennady Zyuganov','CPRF',null],['Yulia Navalnaya','Democratic coalition',null],['Vladislav Davankov','New People',null],['Leonid Slutsky','LDPR',null],['Igor Strelkov','Russian Patriotic Bloc',null],['Grigory Yavlinsky','Yabloko',null],['Sergei Mironov','A Just Russia — For Truth',null]],
    real:'The scenario is fictional: no such election took place. In the 2024 election Putin won 87.3%, Kharitonov 4.3%, Davankov 3.85%, Slutsky 3.2%.'}
};
