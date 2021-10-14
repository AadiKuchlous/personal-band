let arrange_data = [];

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function generateDropdownItems(items) {
  let dropdown_items = []
  items.forEach(
    (item) => {
      let dropdown_item = $('<button/>')
	      .addClass('dropdown-item')
	      .text(item)
	      .attr('value', item)
	      .off('click')
      if (item == "1/4") {
          dropdown_item.addClass('active')
      }

      dropdown_item.click(
          function() {
            $(this).parents('.dropdown-menu').children('.dropdown-item').removeClass('active')
            $(this).addClass('active')
            let block = $(this).parents('.inst_block')
            let length = eval(item)*4
            let old_length = eval(block.attr('length'))
            let new_width = block.width() * length / old_length
            block.width(new_width)
            block.attr('length', length.toString())
            let line_index = parseInt(block.parents('.inst_line').attr('position'))
            let block_index = parseInt(block.attr('position')) - 1
            arrange_data[line_index]['blocks'][block_index]['length'] = length
          }
      )

      dropdown_items.push(dropdown_item)
    }
  )
  return(dropdown_items)
}

function addblock(inst) {
  const arrange_area = $("#arrange-area");

  if (!($.contains(document.body, document.getElementById(inst)))) {
    var div = $('<div/>');
    div.attr('id', inst)
	.addClass("inst_line")
	.css({
	  display :"flex",
	  flexDirection: "row",
	  width: "100%",
	  padding: "10px",
	})
	.attr('position', $("#arrange-area").children(".inst_line").length);
    arrange_area.append(div);

    let line_dict = {
	  "inst": inst,
	  "pos": arrange_data.length + 1,
	  "blocks": []
	};
    arrange_data.push(line_dict);
  }

  let class_name = "block_" + inst;
  var index = $('.'+class_name).length + 1;
  let block = $('<div/>');
  let block_id = inst + index.toString();
  block.addClass(class_name)
	.addClass('inst_block')
	.css({
	    height: "100px",
	    width: "100px",
	    display: "inline-flex",
            position: "relative",
            "border-radius": "10px"
        })
	.attr('id', block_id)
        .attr('position', index)
	.attr('inst', inst)
	.attr('length', 1)
//  block.resizable({grid: [ 100 ], maxHeight: 100, minHeight: 100});

  block.click(function() {
    $( this ).css({
	border: "2px solid #d0d0d0"
    });
    $('.inst_block').not(this).css({
	border: "none"
    });
  });

  block.dblclick(function() {
    loadModal($(this))
    $('#exampleModalCenter').modal('show');
  });

  let length_dropdown = $('<div/>').addClass('dropdown')
        .addClass('length-dropdown')
        .css(
          {
            "bottom": "20px",
            "right": "17px",
            "position": "absolute"
          }
        )

  let length_button = $('<div/>')
	.css(
          {
            "height": "15px",
            "width": "15px",
            "margin-left": "auto",
            "position": "absolute",
            "background": "url(https://static.soundtrap.com/studio/assets/images/studio/rh_end.png) no-repeat"
          }
        )
	.attr('data-toggle', 'dropdown')

  length_dropdown.append(length_button)
  let dropdown_menu = $('<div/>').addClass('dropdown-menu')
  length_options = ['1/16', '1/8', '1/4', '1/2', '1']
  let dropdown_items = generateDropdownItems(length_options)
  dropdown_items.forEach(
    (item) => {
      dropdown_menu.append(item)
    }
  )
  length_dropdown.append(dropdown_menu)
  block.append(length_dropdown)
  
  var color = null;
  switch (inst) {
    case "guitar":
      color = "lightgreen";
      break;
    case "piano":
      color = "pink";
      break;
  }

  block.css({backgroundColor: color});

//  loadModal('#exampleModalCenter', block_id);

  let inst_area = $('#'+inst);

  inst_area.append(block);

  block = $('#' + block_id)
  line_index = parseInt(block.parent('.inst_line').attr("position"));
  
  let block_obj = {}

  block_obj["name"] = inst + index.toString();
  block_obj["length"] = 1;
  
  let notes_modal = $(".modal-body")
  loadModal(block)

  $('#exampleModalCenter').modal('show');
  
  arrange_data[line_index]["blocks"].push(block_obj);

  track_header = $('<div/>').addClass('track-header').html('<b>'+capitalize(inst)+'</b>')
  $('#track-list').append(track_header)
}


function loadModal(block) {
  // Clear the modal
  $(".modal-body").html('')

  line_index = parseInt(block.parent('.inst_line').attr("position"));
  let sounds = fileList[block.attr('inst')]

  // Create tabs for choosing sound in modal
  let nav = $('<nav/>')

  let nav_div = $('<div/>').addClass('nav')
			.addClass('nav-tabs')
			.attr('role', 'tablist')

  let tab_content = $('<div/>').addClass('tab-content')

  for (section in sounds) {
    let tab = $('<button/>')
    tab.addClass('nav-link')
	.attr("data-bs-toggle", "tab")
	.attr('data-bs-target', '#nav-'+section)
	.attr('type', 'button')
	.attr('role', 'tab')
	.attr('aria-controls', 'nav-'+section)
	.attr('aria-selected', 'true')
	.html(capitalize(section))
    nav_div.append(tab)

    let container = $('<div/>').addClass('container')
  				  .css({
				    "width":"100%"
				  })
				  .attr('id', 'nav-'+section)
    let buttons_area = $('<div/>').addClass('row').addClass('justify-content-around')

    Object.entries(sounds[section]).forEach(function ([sound, file], index) {
      let button = $('<button/>').addClass('col-5')
				 .attr('value', section+'/'+sound)
				 .html(sound)
				 .css({
				   "height":"80px"
				 })
      if (Number.isInteger((index+1)/2)) {
        button.addClass('align-self-end')
      }
      else {
        button.addClass('align-self-start')
      }
      buttons_area.append(button)
    })

    container.append(buttons_area)
    tab_content.append(container)
  }
  
  nav.append(nav_div)
  $(".modal-body").append(nav)
  $(".modal-body").append(tab_content)
  
  $(".modal-body").find("button").each(
    function() {
      $(this).off('click');
      $(this).click(
        ((block) => {
          return(
            function() {
              block.attr("sound", $(this).attr("value"))
              block.find('.label').remove()
              block.append($('<div/>').text($(this).attr("value")).css({"align-self":"center", "margin-left":"auto", "margin-right":"auto"}).addClass('label'))
              arrange_data[line_index]["blocks"][parseInt(block.attr('position'))-1]["sound"] = $(this).attr("value")
            }
          )
        })(block)
      )
    }
  );
}
