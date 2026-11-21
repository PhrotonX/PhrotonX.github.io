const Proficiency = Object.freeze({
    NotMeasured: 0,
    LessFamiliar: 1,
    Familiar: 2,
    MoreFamiliar: 3,
    LessKnowledgeable: 4,
    Knowledgeable: 5,
    MoreKnowledgeable: 6,
    LessProficient: 7,
    Proficient: 8,
    MoreProficient: 9,
    Mastered: 10,
});

function getProficiencyName(profNo){
    for(const profName in Proficiency){
        if(Proficiency.hasOwnProperty(profName) && Proficiency[profName] === profNo){
            return profName;
        }
    }

    return "Error retrieving proficiency level name for " + profNo;
}