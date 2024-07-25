export interface Source {
    name: string;
    url: string;
    rssUrl: string;
}

export const sources: Source[] = [
    {name: "36氪", url: "https://36kr.com/", rssUrl: "https://36kr.com/feed"},
    {name: "钛媒体", url: "https://www.tmtpost.com/", rssUrl: "https://www.tmtpost.com/rss.xml"},
    {name: "爱范儿", url: "https://www.ifanr.com/", rssUrl: "https://www.ifanr.com/feed"},
    {name: "虎嗅网", url: "https://www.huxiu.com/", rssUrl: "https://www.huxiu.com/rss/0.xml"},
    {name: "机器之心", url: "https://www.jiqizhixin.com/", rssUrl: "https://www.jiqizhixin.com/rss"}
];
