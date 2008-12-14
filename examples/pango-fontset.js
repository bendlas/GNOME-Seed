#!/usr/bin/env seed

Seed.import_namespace("Pango");
Seed.import_namespace("PangoFT2");

context = new Pango.Context();
description = new Pango.FontDescription();
description.set_family("");
fontmap = new PangoFT2.FontMap();
fontset = fontmap.load_fontset(context, 
			       description, 
			       Pango.language_get_default());
fontset.foreach(
		function(fontset, font)
		{
		    description = font.describe();
		    Seed.print(description.to_string());
		});
