import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const inputDir = process.env.OPTA_INPUT_DIR || "/tmp";
const outputPath = resolve(projectRoot, "dist/data/opta-stats.js");

const leagues = {
  "eng.1": { file: "opta-tournamentstats.json", name: "لیگ برتر انگلیس", source: "https://theanalyst.com/competition/premier-league/stats", logo: "https://theanalyst.com/wp-content/uploads/2024/08/english-premier-league-120x120.png" },
  "esp.1": { file: "opta-la-liga-stats.json", name: "لالیگا اسپانیا", source: "https://theanalyst.com/competition/la-liga/stats", logo: "https://theanalyst.com/wp-content/uploads/2024/08/la-liga-120x120.png" },
  "ita.1": { file: "opta-serie-a-stats.json", name: "سری آ ایتالیا", source: "https://theanalyst.com/competition/serie-a/stats", logo: "https://theanalyst.com/wp-content/uploads/2024/08/serie-a-120x120.png" },
  "ger.1": { file: "opta-bundesliga-stats.json", name: "بوندس‌لیگا آلمان", source: "https://theanalyst.com/competition/bundesliga/stats", logo: "https://theanalyst.com/wp-content/uploads/2024/08/bundesliga-120x120.png" },
  "fra.1": { file: "opta-ligue-1-stats.json", name: "لیگ یک فرانسه", source: "https://theanalyst.com/competition/ligue-1/stats", logo: "https://theanalyst.com/wp-content/uploads/2024/08/ligue-1-120x120.png" },
};

const playerSections = [
  ["att", "attack", "overall"], ["np", "attack", "nonPenalty"],
  ["create", "possession", "chanceCreation"], ["pass", "possession", "passing"],
  ["carry", "carries", "overall"], ["def", "defending", "overall"],
  ["disc", "defending", "discipline"], ["gk", "goalkeeping", "overall"],
];
const teamSections = [
  ["att", "attack", "overall"], ["np", "attack", "non_pen"], ["spatt", "attack", "set_piece"],
  ["amisc", "attack", "misc"], ["pos", "possession", "overall"],
  ["def", "defending", "overall"], ["npdef", "defending", "non_pen"],
  ["spdef", "defending", "set_piece"], ["dmisc", "defending", "misc"],
  ["misc", "misc", "overall"], ["seq", "sequences", "overall"],
];

const metric = (key, label, options = {}) => ({ key, label, ...options });
const metrics = {
  players: [
    { id: "attack", label: "حمله و تمام‌کنندگی", metrics: [
      metric("att_goals", "گل", { rateable: true }), metric("att_xg", "امید گل (xG)", { decimal: 2, rateable: true }),
      metric("att_goals_vs_xg", "اختلاف گل و xG", { signed: true, decimal: 2, rateable: true }), metric("att_shots", "شوت", { rateable: true }),
      metric("att_shots_on_target", "شوت در چارچوب", { rateable: true }), metric("att_shot_conv", "نرخ تبدیل شوت", { percent: true }),
      metric("att_xg_per_shot", "xG به‌ازای هر شوت", { decimal: 2 }), metric("np_np_goals", "گل بدون پنالتی", { rateable: true }),
      metric("np_np_xg", "xG بدون پنالتی", { decimal: 2, rateable: true }), metric("np_np_goals_vs_xg", "اختلاف گل و xG بدون پنالتی", { signed: true, decimal: 2, rateable: true }),
      metric("np_np_shots", "شوت بدون پنالتی", { rateable: true }), metric("np_np_shots_on_target", "شوت در چارچوب بدون پنالتی", { rateable: true }),
      metric("np_np_shot_conv", "نرخ تبدیل بدون پنالتی", { percent: true }), metric("np_np_xg_per_shot", "xG هر شوت بدون پنالتی", { decimal: 2 }),
    ] },
    { id: "creation", label: "خلق موقعیت", metrics: [
      metric("create_assists", "پاس گل", { rateable: true }), metric("create_xa", "امید پاس گل (xA)", { decimal: 2, rateable: true }),
      metric("create_chances_created", "موقعیت ساخته‌شده", { rateable: true }), metric("create_op_chances_created", "موقعیت در جریان بازی", { rateable: true }),
      metric("create_op_xa", "xA در جریان بازی", { decimal: 2, rateable: true }), metric("create_op_assists", "پاس گل در جریان بازی", { rateable: true }),
      metric("create_chances_per_100_pass", "موقعیت در هر ۱۰۰ پاس", { decimal: 2 }), metric("create_chances_sp_op_ratio", "نسبت موقعیت شروع مجدد به جریان بازی", { decimal: 2 }),
    ] },
    { id: "passing", label: "پاس", metrics: [
      metric("pass_passes", "تعداد پاس", { rateable: true }), metric("pass_successful_passes", "پاس موفق", { rateable: true }),
      metric("pass_pass_perc", "دقت پاس", { percent: true }), metric("pass_total_final_third_passes", "پاس به یک‌سوم هجومی", { rateable: true }),
      metric("pass_successful_final_third_passes", "پاس موفق به یک‌سوم هجومی", { rateable: true }), metric("pass_ft_pass_perc", "دقت پاس یک‌سوم هجومی", { percent: true }),
      metric("pass_op_crosses", "ارسال در جریان بازی", { rateable: true }), metric("pass_successful_op_crosses", "ارسال موفق در جریان بازی", { rateable: true }),
      metric("pass_cross_perc", "دقت ارسال", { percent: true }), metric("pass_through_balls", "پاس در عمق", { rateable: true }),
      metric("pass_successful_through_balls", "پاس در عمق موفق", { rateable: true }), metric("pass_through_ball_perc", "دقت پاس در عمق", { percent: true }),
    ] },
    { id: "carries", label: "حمل توپ", metrics: [
      metric("carry_carries", "حمل توپ", { rateable: true }), metric("carry_carry_distance", "مسافت حمل توپ", { distance: true, rateable: true }),
      metric("carry_progressive_carries", "حمل توپ پیش‌رونده", { rateable: true }), metric("carry_progressive_distance", "مسافت پیش‌رونده", { distance: true, rateable: true }),
      metric("carry_shot_ending", "حمل منجر به شوت", { rateable: true }), metric("carry_goal_ending", "حمل منجر به گل", { rateable: true }),
      metric("carry_chance_ending", "حمل منجر به موقعیت", { rateable: true }), metric("carry_assist_ending", "حمل منجر به پاس گل", { rateable: true }),
      metric("carry_dist_per_carry", "مسافت هر حمل", { decimal: 1, distance: true }), metric("carry_dist_per_progressive_carry", "مسافت هر حمل پیش‌رونده", { decimal: 1, distance: true }),
    ] },
    { id: "defending", label: "دفاع", metrics: [
      metric("def_tackles", "تکل", { rateable: true }), metric("def_interceptions", "قطع توپ", { rateable: true }),
      metric("def_recoveries", "بازپس‌گیری توپ", { rateable: true }), metric("def_blocks", "بلاک", { rateable: true }),
      metric("def_clearances", "دفع توپ", { rateable: true }), metric("def_ground_duels", "دوئل زمینی", { rateable: true }),
      metric("def_ground_duels_won", "دوئل زمینی موفق", { rateable: true }), metric("def_ground_duel_perc", "موفقیت دوئل زمینی", { percent: true }),
      metric("def_aerial_duels", "دوئل هوایی", { rateable: true }), metric("def_aerial_duels_won", "دوئل هوایی موفق", { rateable: true }),
      metric("def_aerial_duel_perc", "موفقیت دوئل هوایی", { percent: true }),
    ] },
    { id: "discipline", label: "انضباط", metrics: [
      metric("disc_yellows", "کارت زرد", { rateable: true }), metric("disc_reds", "کارت قرمز", { rateable: true }),
      metric("disc_fouls_commited", "خطای انجام‌شده", { rateable: true }), metric("disc_pens_conceded", "پنالتی داده‌شده", { rateable: true }),
      metric("disc_offsides", "آفساید", { rateable: true }),
    ] },
    { id: "goalkeeping", label: "دروازه‌بانی", metrics: [
      metric("gk_goals_conceded", "گل خورده", { lower: true, rateable: true }), metric("gk_saves_made", "مهار", { rateable: true }),
      metric("gk_save_perc", "درصد مهار", { percent: true }), metric("gk_goals_prevented", "گل جلوگیری‌شده", { signed: true, decimal: 2, rateable: true }),
      metric("gk_goals_prevented_rate", "نرخ جلوگیری از گل", { signed: true, decimal: 2 }), metric("gk_xgot_conceded", "xG در چارچوب دریافتی", { decimal: 2, rateable: true }),
      metric("gk_ogs", "گل به خودی", { rateable: true }), metric("gk_team_mins", "دقایق تیم", { rateable: true }),
      metric("gk_team_mins_perc", "سهم دقایق تیم", { percent: true }),
    ] },
  ],
  teams: [
    { id: "attack", label: "حمله", metrics: [
      metric("att_goals", "گل", { rateable: true }), metric("att_xg", "امید گل (xG)", { decimal: 2, rateable: true }),
      metric("att_goals_vs_xg", "اختلاف گل و xG", { signed: true, decimal: 2, rateable: true }), metric("att_total_shots", "شوت", { rateable: true }),
      metric("att_sot", "شوت در چارچوب", { rateable: true }), metric("att_shot_conv", "نرخ تبدیل شوت", { percent: true }),
      metric("att_xg_per_shot", "xG هر شوت", { decimal: 2 }), metric("att_shots_in_box_perc", "سهم شوت داخل محوطه", { percent: true }),
      metric("att_goals_in_box_perc", "سهم گل داخل محوطه", { percent: true }),
    ] },
    { id: "nonpenalty", label: "بدون پنالتی", metrics: [
      metric("np_np_goals", "گل بدون پنالتی", { rateable: true }), metric("np_team_np_xG", "xG بدون پنالتی", { decimal: 2, rateable: true }),
      metric("np_goals_vs_xg", "اختلاف گل و xG", { signed: true, decimal: 2, rateable: true }), metric("np_np_shots", "شوت بدون پنالتی", { rateable: true }),
      metric("np_np_sot", "شوت در چارچوب بدون پنالتی", { rateable: true }), metric("np_shot_conv", "نرخ تبدیل بدون پنالتی", { percent: true }),
      metric("np_xg_per_shot", "xG هر شوت", { decimal: 2 }), metric("np_shots_in_box_perc", "شوت داخل محوطه", { percent: true }),
      metric("np_goals_in_box_perc", "گل داخل محوطه", { percent: true }),
    ] },
    { id: "setpieces", label: "ضربات ایستگاهی", metrics: [
      metric("spatt_sp_goals", "گل شروع مجدد", { rateable: true }), metric("spatt_sp_shots", "شوت شروع مجدد", { rateable: true }),
      metric("spatt_team_sp_xG", "xG شروع مجدد", { decimal: 2, rateable: true }), metric("spatt_team_sp_goal_perc", "سهم گل شروع مجدد", { percent: true }),
      metric("spatt_team_sp_shot_perc", "سهم شوت شروع مجدد", { percent: true }), metric("spatt_team_sp_xg_perc", "سهم xG شروع مجدد", { percent: true }),
    ] },
    { id: "attackdetail", label: "جزئیات حمله", metrics: [
      metric("amisc_tch_in_box", "لمس توپ در محوطه", { rateable: true }), metric("amisc_hit_woodwork", "ضربه به تیر", { rateable: true }),
      metric("amisc_offsides", "آفساید", { rateable: true }), metric("amisc_pens", "پنالتی", { rateable: true }), metric("amisc_pen_goals", "گل پنالتی", { rateable: true }),
      metric("amisc_dfk", "ضربه آزاد مستقیم", { rateable: true }), metric("amisc_dfk_goals", "گل ضربه آزاد", { rateable: true }),
      metric("amisc_headed_shots", "شوت با ضربه سر", { rateable: true }), metric("amisc_headed_goals", "گل با ضربه سر", { rateable: true }),
      metric("amisc_fast_break_shots", "شوت ضدحمله", { rateable: true }), metric("amisc_fast_break_goals", "گل ضدحمله", { rateable: true }),
    ] },
    { id: "possession", label: "مالکیت و پاس", metrics: [
      metric("pos_pos_perc", "مالکیت توپ", { percent: true }), metric("pos_passes", "پاس", { rateable: true }), metric("pos_successful_pass", "پاس موفق", { rateable: true }),
      metric("pos_accuracy", "دقت پاس", { percent: true }), metric("pos_final_third_passes", "پاس به یک‌سوم هجومی", { rateable: true }),
      metric("pos_successful_final_third_passes", "پاس موفق یک‌سوم هجومی", { rateable: true }), metric("pos_successful_final_third_passes_perc", "دقت پاس یک‌سوم هجومی", { percent: true }),
      metric("pos_successful_long_balls_perc", "دقت پاس بلند", { percent: true }), metric("pos_op_crosses", "ارسال در جریان بازی", { rateable: true }),
      metric("pos_successful_op_crosses", "ارسال موفق", { rateable: true }), metric("pos_op_cross_accuracy_perc", "دقت ارسال", { percent: true }),
      metric("pos_fwd_pass_perc", "سهم پاس رو به جلو", { percent: true }), metric("pos_backward_pass_perc", "سهم پاس رو به عقب", { percent: true }),
      metric("pos_left_pass_perc", "سهم پاس به چپ", { percent: true }), metric("pos_right_pass_perc", "سهم پاس به راست", { percent: true }),
      metric("pos_through_balls", "پاس در عمق", { rateable: true }),
    ] },
    { id: "defending", label: "دفاع", metrics: [
      metric("def_goals_against", "گل خورده", { lower: true, rateable: true }), metric("def_xg_against", "xG دریافتی", { lower: true, decimal: 2, rateable: true }),
      metric("def_goals_vs_xg_conceded", "گل خورده نسبت به xG", { lower: true, signed: true, decimal: 2, rateable: true }), metric("def_total_shots_against", "شوت دریافتی", { lower: true, rateable: true }),
      metric("def_sot_against", "شوت در چارچوب دریافتی", { lower: true, rateable: true }), metric("def_shot_conv_against", "نرخ تبدیل حریف", { lower: true, percent: true }),
      metric("def_xg_per_shot_against", "xG هر شوت حریف", { lower: true, decimal: 2 }), metric("def_shots_in_box_perc_against", "سهم شوت حریف در محوطه", { lower: true, percent: true }),
      metric("def_goals_in_box_perc_against", "سهم گل حریف در محوطه", { lower: true, percent: true }), metric("pos_total_tackles", "تکل", { rateable: true }),
      metric("pos_interceptions", "قطع توپ", { rateable: true }), metric("pos_rec", "بازپس‌گیری", { rateable: true }), metric("pos_blocks", "بلاک", { rateable: true }),
      metric("pos_clearances", "دفع توپ", { rateable: true }), metric("pos_ground_duel_success_perc", "موفقیت دوئل زمینی", { percent: true }),
      metric("pos_aerial_duel_success_perc", "موفقیت دوئل هوایی", { percent: true }),
    ] },
    { id: "defnonpenalty", label: "دفاع بدون پنالتی", metrics: [
      metric("npdef_np_goals_against", "گل خورده بدون پنالتی", { lower: true, rateable: true }), metric("npdef_team_np_xG_against", "xG دریافتی بدون پنالتی", { lower: true, decimal: 2, rateable: true }),
      metric("npdef_goals_vs_xg_against", "گل خورده نسبت به xG", { lower: true, signed: true, decimal: 2, rateable: true }), metric("npdef_np_shots_against", "شوت دریافتی بدون پنالتی", { lower: true, rateable: true }),
      metric("npdef_np_sot_against", "شوت در چارچوب دریافتی", { lower: true, rateable: true }), metric("npdef_shot_conv_against", "نرخ تبدیل حریف", { lower: true, percent: true }),
      metric("npdef_xg_per_shot_against", "xG هر شوت حریف", { lower: true, decimal: 2 }), metric("npdef_shots_in_box_perc_against", "سهم شوت حریف در محوطه", { lower: true, percent: true }),
      metric("npdef_goals_in_box_perc_against", "سهم گل حریف در محوطه", { lower: true, percent: true }),
    ] },
    { id: "defsetpieces", label: "دفاع ایستگاهی", metrics: [
      metric("spdef_sp_goals_against", "گل خورده شروع مجدد", { lower: true, rateable: true }), metric("spdef_sp_shots", "شوت دریافتی شروع مجدد", { lower: true, rateable: true }),
      metric("spdef_team_sp_xG_against", "xG دریافتی شروع مجدد", { lower: true, decimal: 2, rateable: true }), metric("spdef_team_sp_goal_perc_against", "سهم گل خورده شروع مجدد", { lower: true, percent: true }),
      metric("spdef_team_sp_shot_perc_against", "سهم شوت شروع مجدد حریف", { lower: true, percent: true }), metric("spdef_team_sp_xg_perc_against", "سهم xG شروع مجدد حریف", { lower: true, percent: true }),
    ] },
    { id: "defdetail", label: "جزئیات دفاع", metrics: [
      metric("dmisc_opp_tch_in_box", "لمس حریف در محوطه", { lower: true, rateable: true }), metric("dmisc_opp_hit_woodwork", "ضربه حریف به تیر", { lower: true, rateable: true }),
      metric("dmisc_offsides_provoked", "آفسایدگیری", { rateable: true }), metric("dmisc_pens_faced", "پنالتی روبه‌رو", { lower: true, rateable: true }),
      metric("dmisc_pen_goals_against", "گل پنالتی خورده", { lower: true, rateable: true }), metric("dmisc_dfk_against", "ضربه آزاد مستقیم حریف", { lower: true, rateable: true }),
      metric("dmisc_dfk_goals_against", "گل ضربه آزاد خورده", { lower: true, rateable: true }), metric("dmisc_headed_shots_against", "ضربه سر حریف", { lower: true, rateable: true }),
      metric("dmisc_headed_goals_against", "گل با ضربه سر خورده", { lower: true, rateable: true }), metric("dmisc_fast_break_shots_against", "شوت ضدحمله حریف", { lower: true, rateable: true }),
      metric("dmisc_fast_break_goals_against", "گل ضدحمله خورده", { lower: true, rateable: true }),
    ] },
    { id: "discipline", label: "انضباط و تعویض", metrics: [
      metric("misc_subs_used", "تعویض استفاده‌شده", { rateable: true }), metric("misc_subs_goals", "گل بازیکنان تعویضی", { rateable: true }),
      metric("misc_errors_lead_to_shot", "اشتباه منجر به شوت", { lower: true, rateable: true }), metric("misc_errors_lead_to_goal", "اشتباه منجر به گل", { lower: true, rateable: true }),
      metric("misc_fouls_won", "خطای گرفته‌شده", { rateable: true }), metric("misc_opp_yellows", "کارت زرد حریف", { rateable: true }), metric("misc_opp_reds", "کارت قرمز حریف", { rateable: true }),
      metric("misc_pens_won", "پنالتی گرفته‌شده", { rateable: true }), metric("misc_fouls_lost", "خطای انجام‌شده", { lower: true, rateable: true }),
      metric("misc_yellows", "کارت زرد", { lower: true, rateable: true }), metric("misc_reds", "کارت قرمز", { lower: true, rateable: true }), metric("misc_pens_conceded", "پنالتی داده‌شده", { lower: true, rateable: true }),
    ] },
    { id: "sequences", label: "پرس و توالی‌ها", metrics: [
      metric("seq_pressed_sequences", "توالی پرس‌شده", { rateable: true }), metric("seq_build_ups", "ساخت حمله", { rateable: true }), metric("seq_build_up_goals", "گل از ساخت حمله", { rateable: true }),
      metric("seq_direct_attacks", "حمله مستقیم", { rateable: true }), metric("seq_direct_attack_goals", "گل حمله مستقیم", { rateable: true }),
      metric("seq_ten_plus_passes", "توالی ۱۰ پاس یا بیشتر", { rateable: true }), metric("seq_start_distance", "فاصله شروع توالی", { decimal: 1, distance: true }),
      metric("seq_high_turnovers", "توپ‌گیری در بالا", { rateable: true }), metric("seq_shot_ending_high_turnovers", "توپ‌گیری بالا منجر به شوت", { rateable: true }),
      metric("seq_goal_ending_high_turnovers", "توپ‌گیری بالا منجر به گل", { rateable: true }), metric("seq_direct_speed_for", "سرعت حمله مستقیم", { decimal: 2 }),
      metric("seq_passes_for", "پاس در هر توالی", { decimal: 2 }), metric("seq_seq_time_for", "زمان هر توالی", { decimal: 2 }),
      metric("seq_defensive_actions", "کنش دفاعی", { rateable: true }), metric("seq_opposition_passes", "پاس حریف", { rateable: true }),
      metric("seq_ppda", "PPDA", { lower: true, decimal: 2 }), metric("seq_shot_ending_hto_perc", "درصد توپ‌گیری بالا منجر به شوت", { percent: true }),
    ] },
  ],
};

function mergeRows(data, sections, kind) {
  const records = new Map();
  for (const [prefix, group, subgroup] of sections) {
    for (const row of data?.[group]?.[subgroup] || []) {
      const id = kind === "players" ? row.player_id : row.team_id;
      if (id == null) continue;
      const base = records.get(id) || (kind === "players"
        ? { id, n: row.player, t: row.contestantClubName, a: row.apps || 0, m: row.mins_played || 0 }
        : { id, n: row.contestantClubName || row.team, p: row.played || 0 });
      if (kind === "players") {
        base.a = Math.max(base.a || 0, row.apps || 0);
        base.m = Math.max(base.m || 0, row.mins_played || 0);
      } else base.p = Math.max(base.p || 0, row.played || 0);
      for (const [key, value] of Object.entries(row)) {
        if (typeof value !== "number" || ["player_id", "team_id", "apps", "mins_played", "played"].includes(key)) continue;
        base[`${prefix}_${key}`] = value;
      }
      records.set(id, base);
    }
  }
  return [...records.values()];
}

const output = {};
for (const [id, league] of Object.entries(leagues)) {
  const raw = JSON.parse(await readFile(resolve(inputDir, league.file), "utf8"));
  output[id] = {
    name: league.name, source: league.source, logo: league.logo, season: "۲۰۲۶/۲۷",
    updated: raw.player.lastUpdated, players: mergeRows(raw.player, playerSections, "players"),
    teams: mergeRows(raw.team, teamSections, "teams"),
  };
}

await writeFile(outputPath, `window.OPTA_STATS_DATA=${JSON.stringify(output)};\nwindow.OPTA_STATS_METRICS=${JSON.stringify(metrics)};\n`);
console.log(`Built ${outputPath} with ${Object.keys(output).length} leagues.`);
