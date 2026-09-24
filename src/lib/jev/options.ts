export const JEV_8_BALL_OPTIONS = [
  { id: "it_is_certain", label: "It is certain." },
  { id: "it_is_decidedly_so", label: "It is decidedly so." },
  { id: "without_a_doubt", label: "Without a doubt." },
  { id: "yes_definitely", label: "Yes definitely." },
  { id: "you_may_rely_on_it", label: "You may rely on it." },
  { id: "as_i_see_it_yes", label: "As I see it, yes." },
  { id: "most_likely", label: "Most likely." },
  { id: "outlook_good", label: "Outlook good." },
  { id: "yes", label: "Yes." },
  { id: "signs_point_to_yes", label: "Signs point to yes." },
  { id: "reply_hazy_try_again", label: "Reply hazy, try again." },
  { id: "ask_again_later", label: "Ask again later." },
  { id: "better_not_tell_you_now", label: "Better not tell you now." },
  { id: "cannot_predict_now", label: "Cannot predict now." },
  { id: "concentrate_and_ask_again", label: "Concentrate and ask again." },
  { id: "dont_count_on_it", label: "Don't count on it." },
  { id: "my_reply_is_no", label: "My reply is no." },
  { id: "my_sources_say_no", label: "My sources say no." },
  { id: "outlook_not_so_good", label: "Outlook not so good." },
  { id: "very_doubtful", label: "Very doubtful." },
] as const;

export type EightBallId = (typeof JEV_8_BALL_OPTIONS)[number]["id"];

export function criteriaMap(): Record<EightBallId, string> {
  return Object.fromEntries(
    JEV_8_BALL_OPTIONS.map((o) => [o.id, o.label])
  ) as Record<EightBallId, string>;
}

export function labelFor(id: string): string {
  return JEV_8_BALL_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

export function isKnownOptionId(id: string): id is EightBallId {
  return JEV_8_BALL_OPTIONS.some((o) => o.id === id);
}
