import nameDatabase from './nameData.js';

class NameTranslator {
    constructor() {
        this.database = nameDatabase;
    }

    // 主要翻译函数
    translateName(englishName, gender = 'neutral') {
        // 将英文名转换为小写并分割音节
        const name = englishName.toLowerCase();
        const syllables = this.splitIntoSyllables(name);
        
        // 生成三个不同的名字选项
        const suggestions = [];
        for (let i = 0; i < 3; i++) {
            const suggestion = this.generateNameSuggestion(syllables, gender);
            suggestions.push(suggestion);
        }
        
        return suggestions;
    }

    // 将英文名分割成音节
    splitIntoSyllables(name) {
        const syllables = [];
        let currentPos = 0;
        
        while (currentPos < name.length) {
            // 检查双字母组合
            const twoChars = name.substr(currentPos, 2);
            if (this.isCommonCombination(twoChars)) {
                syllables.push(twoChars);
                currentPos += 2;
                continue;
            }
            
            // 检查单个字母
            syllables.push(name[currentPos]);
            currentPos++;
        }
        
        return syllables;
    }

    // 检查是否是常见的双字母组合
    isCommonCombination(chars) {
        const commonCombinations = ['ch', 'th', 'ph', 'sh', 'wh', 'an', 'en', 'in', 'on', 'un'];
        return commonCombinations.includes(chars);
    }

    // 生成一个名字建议
    generateNameSuggestion(syllables, gender) {
        // 选择第一个字
        const firstChar = this.selectFirstCharacter(syllables[0], gender);
        
        // 选择第二个字
        const secondChar = this.selectSecondCharacter(syllables[syllables.length > 1 ? 1 : 0], gender, firstChar);
        
        return {
            chineseName: firstChar.char + secondChar.char,
            pronunciation: `${firstChar.pinyin} ${secondChar.pinyin}`,
            meaning: this.generateMeaning(firstChar, secondChar),
            culturalContext: this.generateCulturalContext(firstChar, secondChar)
        };
    }

    // 选择第一个字
    selectFirstCharacter(syllable, gender) {
        // 首先尝试从音译规则中匹配
        const transliterationOptions = this.database.transliterationRules[syllable] || [];
        
        // 从字符数据库中获取适合的字符
        const genderSpecificChars = this.database.characters.firstChar[gender] || 
                                  this.database.characters.firstChar.neutral;
        
        // 综合考虑音译和含义，选择最合适的字
        const candidates = [...transliterationOptions, ...genderSpecificChars.map(c => c.char)];
        const selectedChar = this.selectBestCharacter(candidates, gender);
        
        return this.getCharacterDetails(selectedChar);
    }

    // 选择第二个字
    selectSecondCharacter(syllable, gender, firstChar) {
        // 避免使用禁忌组合
        const forbiddenChars = this.getForbiddenChars(firstChar.char);
        
        // 获取推荐组合
        const recommendedChars = this.getRecommendedSecondChars(firstChar.char, gender);
        
        // 从字符数据库中获取适合的字符
        const genderSpecificChars = this.database.characters.secondChar[gender] || 
                                  this.database.characters.secondChar.neutral;
        
        // 综合考虑各种因素选择字符
        const candidates = [...recommendedChars, ...genderSpecificChars.map(c => c.char)]
            .filter(char => !forbiddenChars.includes(char));
        
        return this.getCharacterDetails(this.selectBestCharacter(candidates, gender));
    }

    // 获取字符详细信息
    getCharacterDetails(char) {
        // 首先查找文化内涵解释
        const culturalMeaning = this.database.culturalMeanings[char];
        if (culturalMeaning) {
            return {
                char,
                ...culturalMeaning
            };
        }

        // 如果没有找到，返回基本信息
        return {
            char,
            meaning: '未知含义',
            culture: '暂无文化解释',
            personality: '暂无性格特征描述'
        };
    }

    // 生成名字含义解释
    generateMeaning(firstChar, secondChar) {
        return this.database.culturalTemplates.combination.format
            .replace('{name}', firstChar.char + secondChar.char)
            .replace('{char1}', firstChar.char)
            .replace('{meaning1}', firstChar.meaning)
            .replace('{char2}', secondChar.char)
            .replace('{meaning2}', secondChar.meaning)
            .replace('{overall_meaning}', `${firstChar.meaning} and ${secondChar.meaning}`)
            .replace('{cultural_value}', `${firstChar.culture} combined with ${secondChar.culture}`)
            .replace('{personality_traits}', `${firstChar.personality} and ${secondChar.personality}`);
    }

    // 生成文化背景解释
    generateCulturalContext(firstChar, secondChar) {
        return {
            overall: `This name combines the cultural elements of ${firstChar.culture} with ${secondChar.culture}`,
            individual: {
                first: this.database.culturalTemplates.singleChar.format
                    .replace('{char}', firstChar.char)
                    .replace('{pinyin}', firstChar.pinyin)
                    .replace('{meaning}', firstChar.meaning)
                    .replace('{culture}', firstChar.culture)
                    .replace('{personality}', firstChar.personality),
                second: this.database.culturalTemplates.singleChar.format
                    .replace('{char}', secondChar.char)
                    .replace('{pinyin}', secondChar.pinyin)
                    .replace('{meaning}', secondChar.meaning)
                    .replace('{culture}', secondChar.culture)
                    .replace('{personality}', secondChar.personality)
            }
        };
    }

    // 获取禁忌组合中的字符
    getForbiddenChars(firstChar) {
        return this.database.forbiddenCombinations
            .filter(combo => combo[0] === firstChar)
            .map(combo => combo[1]);
    }

    // 获取推荐的第二个字
    getRecommendedSecondChars(firstChar, gender) {
        const recommendations = this.database.recommendedCombinations[gender] || 
                              this.database.recommendedCombinations.neutral;
        
        return recommendations
            .filter(combo => combo.chars[0] === firstChar)
            .map(combo => combo.chars[1]);
    }

    // 从候选字符中选择最佳字符
    selectBestCharacter(candidates, gender) {
        // 如果没有候选字符，返回一个默认字符
        if (candidates.length === 0) {
            return gender === 'feminine' ? '雅' : 
                   gender === 'masculine' ? '文' : '安';
        }
        
        // 随机选择一个字符，但确保不重复使用
        const randomIndex = Math.floor(Math.random() * candidates.length);
        return candidates[randomIndex];
    }
}

export default NameTranslator; 