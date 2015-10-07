// Device Event Listener
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  
    /* for each item with class 'dayInAgenda' check if id is selDay*/
    resetDaysSelection();

	var selDay;

	/* ajax call to get data from agenda.json */
	$.ajax({url: "./agenda.json",
        dataType: "json",
        async: true,
        success: function (data) { 

        	data.days.sort(sort_by('groupLabel', false, function(a){return a.toUpperCase()}));

        	// set first item in agenda as selDay
        	selDay =  data.days[0].groupLabel; // on first access, seleDay is the first day in array

            // load dateList template
            var dateListTemplate = $('#dateListTemplate').html();
            // bind data to template 
            var dList = Mustache.to_html(dateListTemplate, data);   
            // load data into ul  dateList 
            $('.daysInAgenda').append(dList);

			/* build title items */            
            getTitles(data.days);


        },
        error: function (request,error) {
            alert('Network error has occurred please try again!');
        },
        complete: function(data)
        {
        	// set selected item in days list
			$('#'+selDay).addClass("ui-btn-active"); 

			// display titles of selected day
			displaySelectedDayTitles(selDay);

			$('.emptyLi').css('padding','0').css('border','0');
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
	resetDaysSelection();
	selDay = this.id; // id of clicked li by directly accessing DOMElement property
	$('#'+selDay).addClass("ui-btn-active");	
	// display titles of selected day
	displaySelectedDayTitles(selDay);
 });

/* click event on title item in titles list */
$('.itemsInAgenda').on('click', 'li', function() {
	var kids = $(this).children();
	daterange = kids[0].id; // id of clicked div with title
	$('#'+daterange).addClass("ui-btn-active");	
	// display detail of selected title
	displaySelectedTitleDetails(daterange);
 });

