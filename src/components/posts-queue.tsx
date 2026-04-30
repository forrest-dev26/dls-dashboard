"use client";

import { useState } from "react";

const COVER_URLS = {
  salem: "https://d3k81ch9hvuctc.cloudfront.net/company/XFfSeq/images/b9b109d3-7327-4d08-a270-7e2bc82aec82.jpeg",
  titanic: "https://d3k81ch9hvuctc.cloudfront.net/company/XFfSeq/images/23f3d668-11f4-4ea6-9573-2349baf5a45a.jpeg",
  asylum: "https://d3k81ch9hvuctc.cloudfront.net/company/XFfSeq/images/ed7b313e-a653-4f60-a143-c9dab93288b8.jpeg",
};

const POSTS = [
  {
    page: "Salem",
    pageClass: "bg-series-salem",
    coverUrl: COVER_URLS.salem,
    body: `In May of 1692, twenty-six women and four men sat in chains at the Boston jail. Two were under twelve years old. One was over eighty.

The Salem trials lasted nine months. Twenty died. The grief lasted generations.

Twenty-four letters from inside that nine months are at deadletterstudio.com.`,
  },
  {
    page: "Titanic",
    pageClass: "bg-series-titanic",
    coverUrl: COVER_URLS.titanic,
    body: `The Titanic carried 2,224 souls. 1,517 of them died.

But before the iceberg, before the lifeboats, before the freezing North Atlantic, there was a voyage. Five days. Glass chandeliers. Edwardian dresses on a moonlit deck. People falling in love.

Twenty-four letters from those five days are at deadletterstudio.com.`,
  },
  {
    page: "Asylum",
    pageClass: "bg-series-asylum",
    coverUrl: COVER_URLS.asylum,
    body: `Danvers State Hospital opened in 1878 and closed in 1992. At its peak, more than 2,000 people lived there. Some were committed for "religious excitement." Some for "domestic affliction." Some because their husbands signed the papers.

Twenty-four letters from inside one such commitment are at deadletterstudio.com.`,
  },
];

export function PostsQueue() {
  const [statusByIdx, setStatusByIdx] = useState<Record<number, string>>({});

  function handleAction(idx: number, action: "post" | "recreate" | "decline") {
    const labels = {
      post: "Phase 2: would post via Meta Graph API.",
      recreate: "Phase 2: would re-run social engine for fresh draft.",
      decline: "Phase 2: would mark declined and queue replacement.",
    };
    setStatusByIdx((s) => ({ ...s, [idx]: labels[action] }));
    setTimeout(() => {
      setStatusByIdx((s) => {
        const next = { ...s };
        delete next[idx];
        return next;
      });
    }, 3500);
  }

  return (
    <div id="posts-queue" className="grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-1">
      {POSTS.map((post, i) => (
        <div key={i} className="rounded-md border border-line bg-bg-card p-4 px-4 pt-4">
          <div className="mb-2.5 flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-3">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] tracking-wider text-bg ${post.pageClass}`}>
              {post.page}
            </span>
            <span>FB page</span>
          </div>
          <div
            className="mb-3 h-[110px] rounded-sm border border-line bg-bg-soft bg-cover bg-center"
            style={{ backgroundImage: `url('${post.coverUrl}')` }}
          />
          <p className="m-0 mb-3 whitespace-pre-wrap font-display text-[14px] leading-relaxed text-ink">
            {post.body}
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-sm border border-gold bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink hover:bg-gold/80"
              onClick={() => handleAction(i, "post")}
            >
              Post now
            </button>
            <button
              className="rounded-sm border border-line bg-bg-soft px-3.5 py-1.5 text-[12px] font-medium hover:bg-line"
              onClick={() => handleAction(i, "recreate")}
            >
              Recreate
            </button>
            <button
              className="rounded-sm border border-line bg-bg-soft px-3.5 py-1.5 text-[12px] font-medium hover:bg-line"
              onClick={() => handleAction(i, "decline")}
            >
              Decline
            </button>
          </div>
          {statusByIdx[i] && (
            <div className="mt-2 rounded-sm bg-ink/5 px-2 py-1 text-[11px] italic text-ink-3">
              {statusByIdx[i]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
