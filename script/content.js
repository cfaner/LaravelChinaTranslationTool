
(function($, win , doc) {
	
	let URLData = win.location.pathname.split("/");
	//只在翻译页面运行
	if(URLData[1] == undefined || URLData[1] != 'sections') return;
	
	let currentSelectionWord = '';

	let words = {
		data : {} ,
		push : function( word )
		{
			if(isNotEnglishWord( word )) return;
			
			if( this.data [word] != undefined )
			{
				this.data [word] = this.data [word] + 1;
			}
			else
			{
				this.data [word] = 1;
			}
		},
		result : function () {
			return this.data;
		}
	};

	let newWordDataListFromDatabase = database.getJSONItem('new_word');

	let newWordDataList = {
		word : []
	}

	if(newWordDataListFromDatabase)
	{
		newWordDataList = newWordDataListFromDatabase;
	}

	function inNewWordList(word)
	{
		return $.inArray( word , newWordDataList.word ) >= 0;
	}

	function isEnglishWord( word )
	{
		word = $.trim( word );
		let reg = /^[A-Za-z]+$/;
		return reg.test( word )
	}

	function isNotEnglishWord( word )
	{
		return !isEnglishWord( word );
	}

	function reg_replace( str , toStr , exp )
	{
		return str.replace( new RegExp( exp , 'g' ) , toStr );
	}

	function updateNewWord()
	{
		$(".translation-item > p").each(function(i,obj){
			
			let html = $(obj).html();
			
			html = reg_replace( html , "$1" , '<span.*?>(.*?)<\/span>'  );
		 
			for(let w of newWordDataList.word )
			{
				html = reg_replace( html ,  "$1<span style='color:red;font-weight:800;'>"+w+"</span>$2" , '([^A-Za-z0-9])'+w+'([^A-Za-z0-9])'  );
			}
			
			$(obj).html(html);
		});
	}

	updateNewWord();

	function splitContentToWords( content )
	{
		content = content.replace("&nbsp;"," ");
		
		let c = content.split(" ");
	 
		for(let w of c )
		{
			words.push(w);
		}
	}

	$(".translation-item > p").each(function(i,obj){
		splitContentToWords( $(obj).text() );
	});

	function writeTranslantionResultToHtml(result)
	{
		$("#translation-net-result").html("");
		
		if(result.basic != undefined && result.basic.explains != undefined)
		{
			$( result.basic.explains ).each(function(i,obj){
				$("#translation-net-result").append( obj + "<br />" );
			});
		}
		
		if( result.translation != undefined)
		{
			$( result.translation ).each(function(i,obj){
				$("#translation-net-result").append( obj + "<br />" );
			});
		}
		
	}

	function getWordTranslationResult( word , callback )
	{
		let cacheTranslationResult = database.getJSONItem( 'word_cache_' + word.toLowerCase() );
		
		if( cacheTranslationResult )
		{
			callback( cacheTranslationResult ) ;
		}
		else
		{
			chrome.runtime.sendMessage({action: "get_net_translation_result" , "word" : word }, function(response) {
				console.log(response.result);
				database.setJSONItem('word_cache_' + word.toLowerCase() , response.result );
				callback( response.result ) ;
			});
		}

	}

	function showTranslationBox( pageX , pageY )
	{
		$("#translation-box").show();
		$("#translation-box").css({
			"left": ( pageX + 10 ) + "px",
			"top":  ( pageY + 10 ) + "px",
		});
		
		$("#translation-net-result").html("获取中,请稍后!");
		
		getWordTranslationResult( currentSelectionWord ,function( result ){
			writeTranslantionResultToHtml( result );
		});

		if( inNewWordList( currentSelectionWord ))
		{
			$("#btn-cancel-new-word").show();
			$("#btn-new-word").hide();
		}
		else
		{
			$("#btn-cancel-new-word").hide();
			$("#btn-new-word").show();
		}
	}

	chrome.runtime.sendMessage({ action: "get_translation_box_tpl" }, function(response) {
		$("body").append( response.result );
	
		$("#btn-new-word").on('click',function(){
			newWordDataList.word.push(currentSelectionWord);
			database.setJSONItem("new_word",newWordDataList);
			$("#translation-box").hide();
			updateNewWord();
		});

		$("#btn-cancel-new-word").on('click',function(){
			
			newWordDataList.word.splice($.inArray( currentSelectionWord , newWordDataList.word ),1);
			
			database.setJSONItem("new_word",newWordDataList);
			
			$("#translation-box").hide();
			
			updateNewWord();
		});
		
		$("#btn-close").on('click',function(){
			$("#translation-box").hide();
		});
	});
	
	$(".CodeMirror-line").each(function(i,obj){
		
		let html = $(obj).html();
		
		//html = html.replace(',','<b>,</>');
		
		$(obj).html(html);
	});
	
	window.afterDblClick = function ()
	{
		let ai =  setInterval(function(){
			let word = $(".CodeMirror-selectedtext") ;
			if(word.length > 0)
			{
				clearInterval(ai);

				currentSelectionWord = $.trim( word.text() ) ;
			 
				if( isNotEnglishWord( currentSelectionWord )) {
					currentSelectionWord = '';
					return;
				}
				
				showTranslationBox( word.offset().left , word.offset().top );
			}
		},10);
	}
	
	$(document).ready(function()
	{
		$("body").append('<script> var simplemde_left = new SimpleMDE({\
			element: $("textarea")[0] ,\
			spellChecker: false,\
			forceSync: true,\
			toolbar: [ ],\
		});\
		simplemde_left.codemirror.on("dblclick", function(a){\
			console.log( 99999999999999 );\
		});\
		</script>');
	});
 
})(jQuery, window , window.document);
