// Device Event Listener
document.addEventListener("deviceready", onDeviceReady, false);

// debug - per provare senza ripple document.addEventListener("DOMContentLoaded", onDeviceReady, false);

var selDay;

function onDeviceReady() {
	
    $('.app').show();
    
    /* ajax call to get data from agendaAchab.json */
	$.ajax({url: './agendaAchab.json',
        dataType: "json",
        async: true,
        success: function (data) { 

        	data.days.sort(sort_by('groupLabel', false, function(a){return a.toUpperCase()}));

        	// set first item in agenda as firstDay
        	selDay =  data.days[0].groupLabel; // on first access, seleDay is the first day in array

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

            //display selected day titles and hilite current time
            highlightsCurrentEvent();  

            $('.itemsInAgenda').css('margin-top','3px');
            $('.dayInAgenda').css('border-right-width','1px');

            $(document).on("pageshow","#home",function(){
                // set selected item in days list
                $('#'+selDay).addClass("ui-btn-active"); 
            });

            // when user does click on day button in navbar, display all day titles
            $('.daysInAgenda').on('tap', displayDayTitles);

            // when user does click on eventTitle, display details
            $('.agendaTitle').on("tap", displayDetails);

            // when user does click on "> image", load description
            $('.itemDescription').on( "tap", viewDescription );

            // when user does swipeleft on eventDetail, load description
            $('.agendaDetail').on( "swipeleft", viewDescription );

            // when user does click on "speaker name", load speaker data
            $('.speaker').on( "tap", viewSpeakerData );
            
            // when user swiperight on event or speaker page, go back to home
            $('.eventPageContent').on( "swiperight", goHome );
            $('.speakerPageContent').on( "swiperight", goHome );
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
    $('.dayInAgenda').each(function(i, obj) {
    	$('#'+obj.id).removeClass("ui-btn-active");
	});
}

/* function to display all title of a selected day - called by  - called by onDeviceReady() function and onclick eventhandler on button in navbar */
function displaySelectedDayTitles(selDay)
{
    /* reset day selection */
    resetDaysSelection();

    // set selected item in days list
    $('#'+selDay).addClass("ui-btn-active"); 

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

/* click event on button of navigation bar */
function displayDayTitles (event) {
	selDay = event.target.id; // id of clicked li by directly accessing DOMElement property

	// display titles of selected day
	displaySelectedDayTitles(selDay);
 }

function displayDetails (event) {
	daterange = event.target.id; // id of clicked div with title
	//if there is a description, than show details...
    if($('#shortDesc-'+daterange).text() != "")
    {
        $('#'+daterange).addClass("ui-btn-active");	
    	// display detail of selected title
    	displaySelectedTitleDetails(daterange);
    }
}

function viewDescription (event){

    evid = event.target.id;
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
}

/* click event on title item in titles list */
function viewSpeakerData (event) {

    speakerId = event.target.id;

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
 }


/* function to display description of a selected titles - called by onclick eventhandler on titles in titles list*/
function displaySelectedTitleDescription(myevent)
{
    //get event template
    var eventTemplate = $('#eventTemplate').html();
    // bind data to template 
    var eventData = Mustache.to_html(eventTemplate, myevent);   

    // load data into eventContent div
    $('#eventContent').html(eventData);

    //$.mobile.navigate("#selectedEventPage");
    $( ":mobile-pagecontainer" ).pagecontainer( "change", "#selectedEventPage", { transition : "none" } );

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

    //$.mobile.navigate("#selectedSpeakerPage");
    $( ":mobile-pagecontainer" ).pagecontainer( "change", "#selectedSpeakerPage", { transition : "none" } );
}

function highlightsCurrentEvent()
{
    var currentDateTime = moment();

    cdt = getURLParameter("cdt");

    // if exist url paramenter and it's not null
    if(cdt != null && $.trim(cdt) != "null")
    {
        // capire come funziona il time zone; moment js, quando trasforma una stringa nel formato YYYYMMDDTHHmmss,
        // ritorna la data con due ore in più, quindi sicuramente non è 
        // quella locale; per la versione beta sottraggo le due ore di troppo; asap investigherò su come gestire 
        // l'ora locale, in modo da non dover correggere il codice con il cambio dell'ora :)
        currentDateTime = moment(cdt, 'YYYYMMDDTHHmmssZ').subtract(2, 'hours');
    }

    // day item (navbar): class="dayInAgenda" id="{{groupLabel}}" (i.e. id=date formatted in RFC882 (YYYYMMDDT000000Z)
    // hours range item (title) class="agendaTitle" id="{{startDate}}-{{endDate}}" (i.e. date range in RFC882)
    try
    {
        currentDate=currentDateTime.format("YYYYMMDD");
        currentTime=currentDateTime.format("HHmm");
        
        // set current day button active 
        selDay = currentDateTime.format("YYYYMMDD") + "T000000Z";
        displaySelectedDayTitles(selDay);

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

            evDate = evSD.format("YYYYMMDD");

            // current start time
            startTime = evSD.format("HHmm");//((evSD.hour()-2) + '' + evSD.minute() )*1;
            // current end time
            endTime =  evED.format("HHmm");//((evED.hour()-2)+''+(evED.minute()-1))*1;

            if (endTime == "0000") {
                endTime = "2400";
            };            

            // if event date is equal to current date and current time is between star time and end time
            if(evDate == currentDate && currentTime >= startTime && currentTime < endTime)
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

function goHome (event)
{
    //$.mobile.navigate( "#home" );
    $( ":mobile-pagecontainer" ).pagecontainer( "change", "#home", { transition : "none" } );
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

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}