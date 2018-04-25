let database = {
	prefix : "lc_translation_",
	getItem : function( key )
	{
		return localStorage.getItem( this.prefix + key.toLowerCase() );
	},
	getJSONItem : function( key )
	{
		let temp = localStorage.getItem( this.prefix + key.toLowerCase() );
		if(!temp) return null;
		return JSON.parse(temp) ;
	},
	setItem : function( key , value )
	{
		localStorage.setItem( this.prefix + key.toLowerCase() , value );
	},
	setJSONItem : function( key , value )
	{
		value = JSON.stringify( value );
		localStorage.setItem( this.prefix + key.toLowerCase() , value );
	}
};
