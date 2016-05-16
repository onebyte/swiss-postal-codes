
var config =
{
	width: 1200,
	height: 800,
	scale: 1.3,
	start: false,

	init: function()
	{
		this.start = new Date().getTime();
		$('.btn_load').hide();
		$('#load').show();

		path = d3.geo.path()
			.projection(null);

		svg = d3.select(".swiss_plz").append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.append("g");
		  
		g2 = svg.append("g").attr('id', 'swiss_plz');

		svg_swiss_plz = d3.select("#swiss_plz").append("svg")
			.attr("width", this.width)
			.attr("height", this.height);

		svg_swiss_canton = d3.select("#swiss_plz").append("svg")
			.attr("width", this.width)
			.attr("height", this.height);

		svg_swiss_lake = d3.select("#swiss_plz").append("svg")
			.attr("width", this.width)
			.attr("height", this.height);

		color_scale = d3.scale.linear()
			.domain([0, 10000, 100000])
			.range(["#fff", "#bdd700", "#bdd700"]);
	}
}

var loader =
{
	json_path: 'json/',
	canton: false,
	plz_pop: false,
	plz_list: [],
	load_finish_part: {
		1: false,
		2: false,
		3: false,
		4: false
	},

	get_plz_data: function()
	{
		$.getJSON(this.json_path + "plz_data.json", function(plz_pop_json)
		{
			loader.plz_pop = plz_pop_json;
			loader.map_parts();
		});

	},

	map_parts: function()
	{
		loader.load_part(1, 0, 2000);
		loader.load_part(2, 2001, 4000);
		loader.load_part(3, 4001, 8000);
		loader.load_part(4, 8001, 10000);
	},

	lake_and_canton: function()
	{
		d3.json(this.json_path + "cantons_suisses.json", function(error, ch)
		{
			ch.transform.scale[0] *= config.scale;
			ch.transform.scale[1] *= config.scale;

			ch.transform.scale[0] *= 1.058;
			ch.transform.scale[1] *= 1.058;

			ch.transform.translate[0] -= 21;

			ch.transform.translate[1] *= config.scale;
			ch.transform.translate[1] += 31.5;

			$.each(ch.objects.lakes.geometries, function( index, lake )
			{
				var name = lake.properties.name;

				svg_swiss_lake.append("path")
				  .datum(topojson.mesh(ch, lake))
				  .attr("class", "lakes")
				  .attr("d", path)
				  .on('mouseover', function()
				  {
					$('#tooltip_title').html(name);
					$('#tooltip_val').html('');
					$('#tooltip').show();
				  })
				  .on('mouseout', function()
				  {
					if ($('#tooltip:hover').length === 0)
					{
						$('#tooltip').hide();
					}
				  });
			});

			$.each(ch.objects.cantons.geometries, function( index, canton )
			{
				svg_swiss_canton.append("path")
				  .datum(topojson.mesh(ch, canton))
				  .attr("class", "canton_white")
				  .attr("d", path)
				  .attr('canton', canton.properties.abbr);
			});
		});
	},

	load_part: function(part, start, end)
	{

		d3.json(this.json_path + "ch_plz.json", function(error, ch)
		{
			loader.ch = ch.objects.plz.geometries;
			ch.transform.scale[0] *= config.scale;
			ch.transform.scale[1] *= config.scale;
			ch.transform.translate[1] *= config.scale;
			
			$.each(ch.objects.plz.geometries, function(index, plz)
			{
				var plz_num = plz.id;

				if (plz_num in loader.plz_pop)
				{
					var pop = loader.plz_pop[plz_num]['pop'];
					var canton = loader.plz_pop[plz_num]['canton'];
					var commune = loader.plz_pop[plz_num]['commune'];
				}
				else
				{
					var pop = 0;
					var canton = '';
					var commune = '';
				}

				if (loader.canton)
				{
					if (canton != loader.canton)
					{
						return true;
					}
				}

				if (plz_num >= start && plz_num <= end)
				{
					if (!(plz_num in loader.plz_list))
					{
						loader.plz_list.push(plz_num);
					}
					
					svg_swiss_plz.append("path")
					  .datum(topojson.mesh(ch, plz))
					  .attr("class", "plz")
					  .attr("d", path)
					  .attr('fill', color_scale(pop))
					  .attr('plz', plz_num)
					  .on('mouseover', function()
					  {
						this.parentNode.appendChild(this);
						$(this).addClass('hover_zone');

						$('#tooltip_title').html('NPA: ' + plz_num);
						$('#tooltip_val').html('Commune: ' + commune);
						$('#tooltip_val').append('<br>Canton: ' + canton);
						$('#tooltip_val').append('<br>Population: ' + loader.nice_number(pop));
						$('#tooltip').show();
					  })
					  .on('mouseout', function()
					  {
						if ($('#tooltip:hover').length === 0)
						{
							$('#tooltip').hide();
							$(this).removeClass('hover_zone');
						}
					  });
				}
			});

			loader.load_finish_part[part] = true;
			loader.load_finish();
		});
	},

	load_finish: function()
	{
		if (this.load_finish_part[1] && this.load_finish_part[2] && this.load_finish_part[3] && this.load_finish_part[4])
		{
			$("#load").fadeOut(1500);
			$(".btn").fadeIn(1500).css("display","inline-block");
			var end = new Date().getTime();
			var time = ((end - config.start) / 1000).toFixed(2);
			console.log('speed: ' + time + 's');

			if (loader.canton)
			{
				zoomer.zoom_to_canton();	
			}
		}
	},

	nice_number: function(num)
	{
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
	},

	init: function()
	{
		this.lake_and_canton();
		this.get_plz_data();
	}
}

var zoomer =
{
	duration: false,
	timer: false,
	playing: false,
	zoom_scale: 1,
	zoom: false,


	set_duration: function()
	{
		this.duration = $('#time').val() * 1000;
		if (this.playing)
		{
			clearInterval(this.timer);
			this.rand_plz()
			this.timer = setInterval("zoomer.rand_plz()", (this.duration * 2) + 2000);
		}
	},

	set_mouse_zoom: function()
	{
		zoomer.zoom = d3.behavior.zoom()
			.scaleExtent([1, 1000])
			.on("zoom", zoomer.zoomed);

		svg.call(zoomer.zoom).call(zoomer.zoom.event);
	},

	zoomed: function()
	{
		g2
			.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")
			.style('stroke-width', (1 / d3.event.scale) + 'px')
			.selectAll(".canton_white")
			.style('stroke-width', (3 / d3.event.scale) + 'px');

		this.zoom_scale = d3.event.scale;
	},

	dezoom: function()
	{
		if (loader.canton)
		{
			zoomer.zoom_to_canton();	
		}
		else
		{
			var translate = [0,0];
			var scale = 1;
			
			g2.transition()
				.duration(this.duration)
				.style('stroke-width', (1 / scale) + 'px')
				.attr('transform', 'translate(' + translate + ') scale(' + scale + ')')
				.selectAll(".canton_white")
				.style('stroke-width', (3 / scale) + 'px')
				.each('end', function() {
					zoomer.zoom.scale(scale);
					zoomer.zoom.translate(translate);
					zoomer.zoom_scale = scale;
				});
		}
	},

	zoom_to_plz: function()
	{
		var plz = $('#plz').val();

		$('.plz').each(function(index)
		{
			if ($(this).attr('plz') == plz)
			{

				$('#map_info_central_box').html(
					'NPA: ' + plz + '<br>' +
					'Commune: ' + loader.plz_pop[plz]['commune'] + '<br>' + 
					'Canton: ' + loader.plz_pop[plz]['canton'] + '<br>' + 
					'Pop: ' + loader.plz_pop[plz]['pop']
				).fadeIn(zoomer.duration);

				setTimeout(function()
				{
					$('#map_info_central_box').fadeOut(zoomer.duration);
				}, zoomer.duration + 1000);

				var d = $(this).context.__data__;
				zoomer.zoom_to(d);
			}
		});
	},

	zoom_to_canton: function()
	{
		$('.canton_white').each(function(index)
		{
			if ($(this).attr('canton') == loader.canton)
			{
				var d = $(this).context.__data__;
				zoomer.zoom_to(d);
			}
		});
	},

	zoom_to: function(d)
	{
		var bounds = path.bounds(d),
		  dx = bounds[1][0] - bounds[0][0],
		  dy = bounds[1][1] - bounds[0][1],
		  x = (bounds[0][0] + bounds[1][0]) / 2,
		  y = (bounds[0][1] + bounds[1][1]) / 2,
		  scale = .9 / Math.max(dx / config.width, dy / config.height),
		  translate = [config.width / 2 - scale * x, config.height / 2 - scale * y];

		g2
			.transition()
			.duration(this.duration)
			.style('stroke-width', (1 / scale) + 'px')
			.attr("transform", "translate(" + translate + ")scale(" + scale + ")")
			.selectAll(".canton_white")
			.style('stroke-width', (3 / scale) + 'px')
			.each('end', function() {
				zoomer.zoom.scale(scale);
				zoomer.zoom.translate(translate);
				zoomer.zoom_scale = scale;
			});
	},

	play: function()
	{
		if (!this.playing)
		{
			this.playing = true;
			$('#play').html('stop');
			this.start_play();
		}
		else
		{
			this.playing = false;
			$('#play').html('play');
			this.stop_play();
		}
	},

	start_play: function()
	{
		this.rand_plz()
		this.timer = setInterval("zoomer.rand_plz()", (this.duration * 2) + 2000);
	},

	stop_play: function()
	{
		clearInterval(this.timer);
	},

	rand_plz: function()
	{
		plz_alea = loader.plz_list.sort(function(){return 0.5 - Math.random() })[0];
		$('#plz').val(plz_alea);
		this.zoom_to_plz();
		setTimeout(
		function() {
		  zoomer.dezoom();
		}, this.duration + 1000);
	},

	init: function()
	{
		this.set_duration();
		this.set_mouse_zoom();
	}
}


// EVENT

$('#plz').keypress(function(e)
{
	if(e.which == 13)
	{
		zoomer.zoom_to_plz();
	}
});

$('#btn_load_swiss_map').click(function()
{
	load(false);
});

$('#btn_load_vaud_map').click(function()
{
	load('VD');
});

$('#zoom_to').click(function()
{
	zoomer.zoom_to_plz();
});

$('#reset_zoom').click(function()
{
	zoomer.dezoom();
});

$('#play').click(function()
{
	zoomer.play();
});

$('#time').keyup(function()
{
	zoomer.set_duration();
});

(function()
{
	document.onmousemove = handleMouseMove;
	function handleMouseMove(event)
	{
		event = event || window.event;
		$('#tooltip').css({'top':event.pageY,'left':event.pageX});
	}
})();


// INIT
function load(canton)
{
	if (canton)
	{
		loader.canton = canton;
	}

	config.init();
	loader.init();
	zoomer.init();
}
