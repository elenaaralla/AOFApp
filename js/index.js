// Device Event Listener
document.addEventListener("deviceready", onDeviceReady, false);

// debug - per provare senza ripple document.addEventListener("DOMContentLoaded", onDeviceReady, false);

var firstDay;

function onDeviceReady() {

	/* ajax call to get data from agendaAchab.json */
	$.ajax({url: "./agendaAchab.json",
        dataType: "json",
        async: true,
        success: function (data) { 

        	data.days.sort(sort_by('groupLabel', false, function(a){return a.toUpperCase()}));

        	// set first item in agenda as firstDay
        	firstDay =  data.days[0].groupLabel; // on first access, seleDay is the first day in array

            // load dateList template
            var dateListTemplate = $('#dateListTemplate').html();
            // bind data to template 
            var dList = Mustache.to_html(dateListTemplate, data);   
            // load data into ul  dateList 
            $('.daysInAgenda').html(dList);

			/* build title items */            
            getTitles(data.days);


        },
        error: function (request,error) {
            alert('Network error has occurred please try again!');
        },
        complete: function(data)
        {   
            $('.emptyLi').css('padding','0.5rem').css('border','0').css('background-color','transparent');

			// display titles of selected day
			displaySelectedDayTitles(firstDay);

            highlightsCurrentEvent();  

            $('.itemsInAgenda').css('margin-top','3px');
            $('.dayInAgenda').css('border-right-width','1px');
        }
    });   
}

/* get all title in file json - called from onDeviceReady function */
function getTitles(daysArray)
{
	$.each(daysArray, function(index, item) {
       item.titlesGroup.sort(sort_by('startDate', false, function(a){return a.toUpperCase()}));

       // load titleListTemplate template
        var titleListTemplate = $('#titleListTemplate').html();
        // bind data to template 
        var tList = Mustache.to_html(titleListTemplate, item);   
        // load data into ul  dateList 
        $('.itemsInAgenda').append(tList);

        $('.titleInAgenda').addClass("ui-btn ui-li-has-arrow ui-li ui-first-child ui-btn-up-c");
        $('.agendaTitle').addClass("ui-btn-text left");
        $('.agendaDetail').addClass("left");
	});
}

/* funtction to "deactivate" button on navbar - called by onDeviceReady() function and onclick eventhandler on button in navbar */
function resetDaysSelection()
{
	/* for each item with class 'dayInAgenda' check if id is selDay*/
    $('.dayInAgenda').each(function(i, obj) {
    	$('#'+obj.id).removeClass("ui-btn-active");
	});
}

/* function to display all title of a delected day - called by  - called by onDeviceReady() function and onclick eventhandler on button in navbar */
function displaySelectedDayTitles(selDay)
{
    /* reset day selection */
    resetDaysSelection();

    if($('#'+selDay).lenght == 0)
    {
        selDay = firstDay;
    }
    else
    {
        // set selected item in days list
        $('#'+selDay).addClass("ui-btn-active"); 
    }

    // reset highlightning
    $('.titleInAgenda').removeClass('highlight');

    //hide all li
    $('.titleInAgenda').hide();

    //hide all details
    $('.agendaDetail').hide();

	// Left part of the selDay until caratter T
	curDay = selDay.split('T')[0];
	// display all title which class start with "title-"+curDay	
	$("[id^=title-" + curDay + "]").show();
}

/* function to display/hide details of a selected titles - called by onclick eventhandler on titles in titles list*/
function displaySelectedTitleDetails(daterange)
{
	obj = $("#details-"+daterange);

	if(obj.css("display") == "none")
	{
		obj.show();
	}
	else
	{
		obj.hide();
	}
}

/* function to sort data read from json data file - called from onDeviceReady() and getTitles() functions*/
var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}

/* click event on button of navigation bar */
$('.daysInAgenda').on('click', 'a', function() {
	selDay = this.id; // id of clicked li by directly accessing DOMElement property
	$('#'+selDay).addClass("ui-btn-active");	
	// display titles of selected day
	displaySelectedDayTitles(selDay);
 });

/* click event on title item in titles list */
$('.itemsInAgenda').on('click', '.agendaTitle', function() {
	daterange = this.id; // id of clicked div with title
	//if there is a description, than show details...
    if($('#shortDesc-'+daterange).text() != "")
    {
        $('#'+daterange).addClass("ui-btn-active");	
    	// display detail of selected title
    	displaySelectedTitleDetails(daterange);
    }
 });

/* click event on title item in titles list */
$('.itemsInAgenda').on('click', '.itemDescription', function() {

    evid = this.id;

    evIdArr = evid.split('-');

    evSD = evIdArr[1];
    evED = evIdArr[2];
    
    var myEvent;

    /* ajax call to get data from agendaAchab.json */
    $.ajax({url: "./agendaAchab.json",
        dataType: "json",
        async: true,
        success: function (data) { 

            $.each(data.days, function(i, v) {
                $.each(v.titlesGroup, function(j, o) {
                    if (o.startDate == evSD && o.endDate == evED) {
                        myEvent = o
                        return;
                    }
                });                
            });
         
        },
        error: function (request,error) {
            alert('Network error has occurred please try again!');
        },
        complete: function(data)
        {
            displaySelectedTitleDescription(myEvent);
        }
    });
 });

/* click event on title item in titles list */
$('.itemsInAgenda').on('click', '.speaker', function() {

    speakerId = this.id;

    speakerIdArr = speakerId.split('-');

    spName = speakerIdArr[0];
    spLastname = speakerIdArr[1];
    if(speakerIdArr.length > 2)
    {
        spLastname = spLastname + '-' + speakerIdArr[2]
    }
    
    var mySpeaker;

    /* ajax call to get data from agendaAchab.json */
    $.ajax({url: "./agendaAchab.json",
        dataType: "json",
        async: true,
        success: function (data) { 

            $.each(data.days, function(i, v) {
                $.each(v.titlesGroup, function(j, o) {
                    $.each(o.speakers, function(h, s) {
                        if (s.name.toLowerCase() == spName && s.lastname.toLowerCase() == spLastname) {
                            mySpeaker = s
                            return;
                        }
                    });
                });                
            });
         
        },
        error: function (request,error) {
            alert('Network error has occurred please try again!');
        },
        complete: function(data)
        {
            displaySelectedSpeaker(mySpeaker);
        }
    });
 });


/* function to display description of a selected titles - called by onclick eventhandler on titles in titles list*/
function displaySelectedTitleDescription(myevent)
{
    //get event template
    var eventTemplate = $('#eventTemplate').html();
    // bind data to template 
    var eventData = Mustache.to_html(eventTemplate, myevent);   

    // load data into eventContent div
    $('#eventContent').html(eventData);

    $.mobile.changePage("#selectedEventPage");
}

/* function to display curriculum of a selected speaker - called by onclick eventhandler on link in speakers list*/
function displaySelectedSpeaker(myspeaker)
{
    //get speakerContent template
    var speakerTemplate = $('#speakerTemplate').html();
    // bind data to template 
    var speakerData = Mustache.to_html(speakerTemplate, myspeaker);   

    // load data into speakerContent div
    $('#speakerContent').html(speakerData);

    $.mobile.changePage("#selectedSpeakerPage");
}


function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function highlightsCurrentEvent()
{
    var currentDateTime = moment();

    cdt = getURLParameter("cdt");

    // if exist url paramenter 
    if(cdt)
    {
        currentDateTime = moment(cdt, 'YYYYMMDDTHHmmssZ');
        console.log("url.cdt = " + cdt);
    }

    // day item (navbar): class="dayInAgenda" id="{{groupLabel}}" (i.e. id=date formatted in RFC882 (YYYYMMDDT000000Z)
    // hours range item (title) class="agendaTitle" id="{{startDate}}-{{endDate}}" (i.e. date range in RFC882)

    dayInAgendaId = "";

    try
    {
        currentTime=currentDateTime.subtract(2, 'hours').format("HHmm");
        
        // set current day button active 
        dayInAgendaId = currentDateTime.format("YYYYMMDD") + "T000000Z";
        displaySelectedDayTitles(dayInAgendaId);

        // highlight right title
        $(".agendaTitle").each(function() {
          if ($(this).css("display") == "block") {

            evid = this.id;

            evIdArr = evid.split('-');
            // event start date 
            evSD = moment(evIdArr[0], 'YYYYMMDDTHHmmssZ').subtract(2, 'hours');
            // event end date
            evED = moment(evIdArr[1], 'YYYYMMDDTHHmmssZ').subtract(2, 'hours');
    
            // current time
            //currentTime = (c_hour+c_min)*1;

            // current start time
            startTime = evSD.format("HHmm");//((evSD.hour()-2) + '' + evSD.minute() )*1;
            // current end time
            endTime =  evED.format("HHmm");//((evED.hour()-2)+''+(evED.minute()-1))*1;

            if (endTime == "0000") {
                endTime = "2400";
            };            

            // if current hour is between star date hour and end date hour and current minutes are between 
            //  star date hour and end date hour
            if(currentTime >= startTime && currentTime <= endTime)
            {
                $(this).addClass("highlight");
            }
          }

        });
    }
    catch (err)
    {
        console.log("err = " + err);
    }
}
