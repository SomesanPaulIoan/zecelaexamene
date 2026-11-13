import type { Metadata } from "next";
import Image from "next/image";
import { subjectVisual } from "@/lib/subject-visuals";
import { TEAM } from "@/lib/team";
import { SocialIcon } from "@/components/SocialIcon";

export const metadata: Metadata = {
  title: "Despre noi",
  description:
    "Echipa Zece la Examene — profesori și olimpici care pregătesc elevi pentru Bacalaureat și admiterea la facultate.",
};

function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand via-blue-600 to-indigo-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Despre noi</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Suntem echipa Zece la Examene — profesori și olimpici care pregătesc elevi pentru
            Bacalaureat și admiterea la facultate, cu explicații clare și rezultate reale.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {TEAM.map((member) => {
            const visual = subjectVisual(member.subject);
            return (
              <div
                key={member.name}
                className="flex gap-4 rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={88}
                    height={88}
                    className={`h-[88px] w-[88px] flex-none rounded-full object-cover ring-2 ${visual.ring}`}
                  />
                ) : (
                  <div
                    className={`flex h-[88px] w-[88px] flex-none items-center justify-center rounded-full text-xl font-bold text-white ${visual.solid}`}
                  >
                    {initials(member.name)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">{member.name}</p>
                  <p className={`text-sm font-medium ${visual.text}`}>{member.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{member.bio}</p>
                  {(member.facebook || member.instagram || member.linkedin) && (
                    <div className="mt-3 flex gap-3 text-slate-400">
                      {member.facebook && (
                        <a
                          href={member.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-slate-700"
                        >
                          <SocialIcon type="facebook" />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-slate-700"
                        >
                          <SocialIcon type="instagram" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-slate-700"
                        >
                          <SocialIcon type="linkedin" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
