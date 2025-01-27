// 名字数据库
const nameDatabase = {
    // 常用字库
    commonCharacters: {
        // 按声调分类的常用字
        first: {
            // 一声
            tone1: [
                { char: '明', pinyin: 'míng', meaning: 'bright', usage: 'common', gender: 'neutral' },
                { char: '华', pinyin: 'huá', meaning: 'splendid', usage: 'common', gender: 'neutral' },
                { char: '天', pinyin: 'tiān', meaning: 'heaven', usage: 'common', gender: 'neutral' },
                { char: '文', pinyin: 'wén', meaning: 'culture', usage: 'common', gender: 'neutral' },
                { char: '雅', pinyin: 'yǎ', meaning: 'elegant', usage: 'common', gender: 'feminine' }
            ],
            // 二声
            tone2: [
                { char: '永', pinyin: 'yǒng', meaning: 'eternal', usage: 'common', gender: 'neutral' },
                { char: '安', pinyin: 'ān', meaning: 'peace', usage: 'common', gender: 'neutral' },
                { char: '丽', pinyin: 'lì', meaning: 'beautiful', usage: 'common', gender: 'feminine' }
            ]
        },
        middle: {
            // 常用于中间的字
            common: [
                { char: '嘉', pinyin: 'jiā', meaning: 'excellent', usage: 'middle', gender: 'neutral' },
                { char: '佳', pinyin: 'jiā', meaning: 'good', usage: 'middle', gender: 'neutral' },
                { char: '雪', pinyin: 'xuě', meaning: 'snow', usage: 'middle', gender: 'feminine' }
            ]
        },
        last: {
            // 常用于结尾的字
            common: [
                { char: '龙', pinyin: 'lóng', meaning: 'dragon', usage: 'last', gender: 'masculine' },
                { char: '凤', pinyin: 'fèng', meaning: 'phoenix', usage: 'last', gender: 'feminine' },
                { char: '华', pinyin: 'huá', meaning: 'splendid', usage: 'last', gender: 'neutral' }
            ]
        }
    },

    // 音译规则 - 按照英文发音规则分类
    transliterationRules: {
        // 元音
        'a': ['安', '艾', '爱', '昂', '奥'],
        'e': ['埃', '恩', '厄', '尔', '伊'],
        'i': ['伊', '依', '易', '意', '艺'],
        'o': ['奥', '欧', '鸥', '澳', '敖'],
        'u': ['优', '宇', '玉', '育', '瑜'],
        
        // 常见音节
        'an': ['安', '岸', '暗', '昂', '盎'],
        'en': ['恩', '摁', '嗯'],
        'in': ['因', '音', '银', '茵', '寅'],
        'on': ['翁', '旺', '昂'],
        'un': ['温', '文', '汶', '纹'],

        // 辅音开头
        'ma': ['马', '玛', '麦', '茉', '梅'],
        'me': ['梅', '美', '媚', '眉'],
        'mi': ['米', '密', '蜜', '敏', '明'],
        'mo': ['莫', '默', '漠', '墨', '慕'],
        'mu': ['穆', '木', '牧', '慕'],

        'ja': ['佳', '嘉', '家', '加', '珈'],
        'je': ['杰', '婕', '洁', '捷'],
        'ji': ['吉', '基', '济', '继', '纪'],
        'jo': ['乔', '焦', '娇', '佼'],
        'ju': ['居', '菊', '俊', '君', '钧'],

        // 更多常见组合
        'ch': ['志', '智', '昌', '晨', '辰'],
        'th': ['思', '斯', '司', '泰', '廷'],
        'ph': ['菲', '芬', '凤', '芳', '枫'],
        'sh': ['世', '书', '舒', '诗', '尚'],
        'wh': ['维', '威', '伟', '卫', '文'],

        // 常见结尾
        'ry': ['莉', '丽', '瑞', '蕊', '睿'],
        'ly': ['莉', '丽', '理', '黎', '俐'],
        'ny': ['妮', '尼', '倪', '妳', '霓'],
        'na': ['娜', '纳', '娜', '妮', '楠']
    },

    // 字义数据库 - 按用途分类
    characters: {
        // 适合用作名字第一个字
        firstChar: {
            masculine: [
                {
                    char: '志',
                    pinyin: 'zhì',
                    meaning: 'ambition, aspiration',
                    culture: 'Represents determination and noble goals',
                    personality: 'Determined and goal-oriented',
                    usage: 'Often used in male names to indicate ambition'
                },
                {
                    char: '文',
                    pinyin: 'wén',
                    meaning: 'culture, literature, refinement',
                    culture: 'Symbolizes scholarly pursuit and cultural achievement',
                    personality: 'Cultured and intellectual',
                    usage: 'Common in names valuing education'
                },
                {
                    char: '俊',
                    pinyin: 'jùn',
                    meaning: 'handsome, talented',
                    culture: 'Represents both physical and intellectual excellence',
                    personality: 'Talented and accomplished',
                    usage: 'Popular in male names'
                }
            ],
            feminine: [
                {
                    char: '雅',
                    pinyin: 'yǎ',
                    meaning: 'elegant, refined',
                    culture: 'Embodies classical Chinese aesthetics',
                    personality: 'Graceful and sophisticated',
                    usage: 'Frequently used in female names'
                },
                {
                    char: '婷',
                    pinyin: 'tíng',
                    meaning: 'graceful, pretty',
                    culture: 'Represents feminine beauty and grace',
                    personality: 'Elegant and poised',
                    usage: 'Very common in female names'
                },
                {
                    char: '美',
                    pinyin: 'měi',
                    meaning: 'beautiful',
                    culture: 'Represents beauty in both appearance and spirit',
                    personality: 'Beautiful and kind',
                    usage: 'Popular in female names'
                }
            ],
            neutral: [
                {
                    char: '明',
                    pinyin: 'míng',
                    meaning: 'bright, clear, intelligent',
                    culture: 'Symbolizes wisdom and clarity',
                    personality: 'Intelligent and clear-minded',
                    usage: 'Suitable for all genders'
                },
                {
                    char: '安',
                    pinyin: 'ān',
                    meaning: 'peace, tranquility',
                    culture: 'Represents harmony and stability',
                    personality: 'Peaceful and stable',
                    usage: 'Universal usage'
                }
            ]
        },

        // 适合用作名字第二个字
        secondChar: {
            masculine: [
                {
                    char: '杰',
                    pinyin: 'jié',
                    meaning: 'outstanding, extraordinary',
                    culture: 'Represents exceptional ability',
                    personality: 'Excellent and capable',
                    usage: 'Common as second character in male names'
                },
                {
                    char: '强',
                    pinyin: 'qiáng',
                    meaning: 'strong, powerful',
                    culture: 'Symbolizes strength and capability',
                    personality: 'Strong and reliable',
                    usage: 'Popular in male names'
                }
            ],
            feminine: [
                {
                    char: '玲',
                    pinyin: 'líng',
                    meaning: 'tinkling of jade',
                    culture: 'Associated with the beauty of jade',
                    personality: 'Delicate and refined',
                    usage: 'Common in female names'
                },
                {
                    char: '琳',
                    pinyin: 'lín',
                    meaning: 'jade, beautiful',
                    culture: 'Connected to precious jade',
                    personality: 'Beautiful and precious',
                    usage: 'Frequently used in female names'
                }
            ],
            neutral: [
                {
                    char: '华',
                    pinyin: 'huá',
                    meaning: 'splendid, magnificent',
                    culture: 'Represents cultural excellence',
                    personality: 'Distinguished and cultured',
                    usage: 'Suitable for all genders'
                }
            ]
        }
    },

    // 文化内涵解释
    culturalMeanings: {
        '明': {
            meaning: 'bright, clear, intelligent',
            culture: 'Represents wisdom and clarity in Chinese culture',
            personality: 'Intelligent and insightful person',
            combinations: ['明华', '明月', '明德']
        },
        '华': {
            meaning: 'splendid, magnificent, China',
            culture: 'Often represents Chinese culture and civilization',
            personality: 'Cultured and refined character',
            combinations: ['华明', '华安', '华龙']
        },
        '志': {
            meaning: 'ambition, aspiration',
            culture: 'Represents determination and noble goals',
            personality: 'Determined and goal-oriented',
            combinations: ['志远', '志强', '志华']
        },
        '文': {
            meaning: 'culture, literature, refinement',
            culture: 'Symbolizes education and cultural accomplishment',
            personality: 'Scholarly and cultured',
            combinations: ['文华', '文德', '文明']
        },
        '德': {
            meaning: 'virtue, morality',
            culture: 'Embodies traditional Chinese virtues',
            personality: 'Virtuous and ethical',
            combinations: ['德明', '德华', '德志']
        },
        '安': {
            meaning: 'peace, tranquility, contentment',
            culture: 'Represents stability and serenity in Chinese culture',
            personality: 'Peaceful, stable, and reliable character',
            combinations: ['安然', '安宁', '安康', '安泰']
        },
        '龙': {
            meaning: 'dragon',
            culture: 'Symbol of power, strength, and good fortune in Chinese culture',
            personality: 'Strong, ambitious, and successful',
            combinations: ['华龙', '明龙', '天龙']
        },
        '雅': {
            meaning: 'elegant, refined, graceful',
            culture: 'Embodies classical Chinese aesthetics',
            personality: 'Cultured and sophisticated',
            combinations: ['雅致', '雅韵', '雅婷', '雅芝']
        }
        // 更多文化解释...
    },

    // 禁忌组合
    forbiddenCombinations: [
        ['死', '亡'], // 不吉利
        ['亡', '命'],
        ['绝', '望'],
        ['哀', '伤'],
        ['病', '痛'],
        ['灾', '祸']
    ],

    // 推荐组合
    recommendedCombinations: {
        masculine: [
            {
                chars: ['志', '华'],
                meaning: 'Ambitious and magnificent',
                culture: 'Combines personal ambition with cultural excellence'
            },
            {
                chars: ['文', '杰'],
                meaning: 'Cultured and outstanding',
                culture: 'Represents scholarly excellence'
            }
        ],
        feminine: [
            {
                chars: ['雅', '琳'],
                meaning: 'Elegant and beautiful like jade',
                culture: 'Embodies classical beauty'
            },
            {
                chars: ['婷', '玲'],
                meaning: 'Graceful and delicate',
                culture: 'Represents feminine grace'
            }
        ],
        neutral: [
            {
                chars: ['安', '华'],
                meaning: 'Peaceful and magnificent',
                culture: 'Represents harmonious excellence'
            }
        ]
    },

    // 添加详细的文化解读模板
    culturalTemplates: {
        // 单字解读
        singleChar: {
            format: "{char}({pinyin}) means '{meaning}'. In Chinese culture, it {culture}. People with this character in their name often show {personality} traits."
        },
        // 组合解读
        combination: {
            format: "The name {name} combines {char1}({meaning1}) and {char2}({meaning2}), suggesting {overall_meaning}. This name reflects {cultural_value} in Chinese culture and implies a personality that is {personality_traits}."
        }
    },

    // 添加音节匹配规则
    syllableRules: {
        vowels: ['a', 'e', 'i', 'o', 'u'],
        consonants: ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's'],
        tones: {
            first: ['明', '华', '天', '文'],
            second: ['安', '德', '宁'],
            third: ['志', '美', '伟'],
            fourth: ['德', '智', '泰']
        }
    },

    // 添加发音规则
    phoneticRules: {
        // 声母
        initials: {
            labial: ['b', 'p', 'm', 'f'],
            dental: ['d', 't', 'n', 'l'],
            guttural: ['g', 'k', 'h']
        },
        // 韵母
        finals: {
            a: ['a', 'ia', 'ua'],
            i: ['i', 'ai', 'ei'],
            u: ['u', 'ou', 'iu']
        },
        // 声调组合规则
        tonePatterns: {
            good: [
                [1, 3], [2, 4], [4, 2], [3, 1]  // 好的声调搭配
            ],
            avoid: [
                [1, 1], [2, 2], [3, 3], [4, 4]  // 避免的声调搭配
            ]
        }
    }
};

export default nameDatabase; 