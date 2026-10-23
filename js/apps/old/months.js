const Months = Object.freeze({
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12
});

function getMonthName(monthNo){
    for(const monthName in Months){
        if(Months.hasOwnProperty(monthName) && Months[monthName] === monthNo){
            return monthName;
        }
    }

    return "Error retrieving month name";
}

function getMonthWithLeadingZeroStr(monthNo){
    if(monthNo >= 10){
        return monthNo.toString();
    }else{
        return "0" + monthNo;
    }
}