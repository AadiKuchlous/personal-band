let arrange_data = [];
let block_length_options = ['1/16', '1/8', '1/4', '1/2', '1']
let selected_block = null;

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
            let block = $(this).parents('.inst-block')
            let length = eval(item)*4
            let old_length = eval(block.attr('length'))
            let new_width = block.width() * length / old_length
            block.width(new_width)
            block.attr('length', length.toString())
            let line_index = parseInt(block.parents('.inst-line').attr('position'))
            let block_index = parseInt(block.attr('position'))
            arrange_data[line_index]['blocks'][block_index]['length'] = length
          }
      )

      dropdown_items.push(dropdown_item)
    }
  )
  return(dropdown_items)
}

function generateBlockLengthDropdown() {
  let length_dropdown = $('<div/>').addClass('dropdown').addClass('block-length-dropdown')

  let length_button = $('<div/>')
        .addClass('block-length-dropdown-toggle') 
	.attr('data-toggle', 'dropdown')

  length_dropdown.append(length_button)
  let dropdown_menu = $('<div/>').addClass('dropdown-menu')
  let dropdown_items = generateDropdownItems(block_length_options)
  dropdown_items.forEach(
    (item) => {
      dropdown_menu.append(item)
    }
  )
  length_dropdown.append(dropdown_menu)

  return(length_dropdown)
}

function addLine(inst) {
  let arrange_area = $("#arrange-area");
  let div = $('<div/>');
  let index = $('.'+inst+'-line').length
  let id = inst+'-'+index.toString()
  div.attr('id', id)
	.addClass("inst-line")
	.addClass(inst+'-line')
	.attr('position', $("#arrange-area").children(".inst-line").length);

  let add_button = $('<div/>').addClass('add-block').append($('<img/>').attr('src', 'https://img.icons8.com/ios-glyphs/30/000000/plus-math.png'))
  add_button.click(((inst, id) => {
    return function() {
      addblock(inst, id, false)
    }
  })(inst,id))
  div.append(add_button);
  arrange_area.append(div);

  var color = null;
  switch (inst) {
    case "guitar":
      color = "lightgreen";
      break;
    case "piano":
      color = "pink";
      break;
  }


  let line_index = arrange_data.length;
  let line_dict = {
	  "inst": inst,
	  "pos": line_index,
	  "blocks": [],
          "color": color
	};
  arrange_data.push(line_dict);
  let track_header = $('<div/>').addClass('track-header').html('<b>'+capitalize(inst)+'</b>').css({'grid-row-start': line_index+1, 'grid-row-end': line_index+2});
  $('#track-list-grid').append(track_header)

}


function addblock(inst, id, from_load, arrange_area_data=false) {
  let arrange_area = $("#arrange-area");
  let inst_line = $('#'+id);
  line_index = inst_line.attr("position");

  let class_name = "block_" + inst;
  var index = inst_line.children('.'+class_name).length;
  let block = $('<div/>');
  let block_id = id + '-' + index.toString();
  block.addClass(class_name)
	.addClass('inst-block')
	.attr('id', block_id)
        .attr('position', index)
	.attr('inst', inst)
	.attr('length', 1)
//  block.resizable({grid: [ 100 ], maxHeight: 100, minHeight: 100});

  block.click(function() {
    $( this ).css({
	border: "2px solid #d0d0d0"
    });
    $('.inst-block').not(this).css({
	border: "none"
    });
    selected_block = $(this);
  });

  block.dblclick(function() {
    loadModal($(this))
    $('#exampleModalCenter').modal('show');
  });

  let length_dropdown = generateBlockLengthDropdown();
  block.append(length_dropdown);

  let line_obj = null;
  if (arrange_area_data) {
    line_obj = arrange_area_data[line_index];
  }
  else {
    line_obj = arrange_data[line_index];    
  }
  block.css({backgroundColor: line_obj['color']});

  if (from_load) {
    let sound = line_obj['blocks'][index]['sound'];
    block.attr('sound', sound);
    block.append($('<div/>').addClass('block-label').text(sound))
  }

  inst_line.append(block);

  if (!from_load) {
    block = $('#' + block_id)
  
    let block_obj = {}

    block_obj["name"] = inst + index.toString();
    block_obj["length"] = 1;
  
    let notes_modal = $(".modal-body")
    loadModal(block)

    $('#exampleModalCenter').modal('show');
  
    line_obj["blocks"].push(block_obj);
  }
}


function loadModal(block) {
  // Clear the modal
  $(".modal-body").html('')

  let line_index = parseInt(block.parent('.inst-line').attr("position"));
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
              block.find('.block-label').remove()
              block.append($('<div/>').text($(this).attr("value")).addClass('block-label'))
              arrange_data[line_index]["blocks"][parseInt(block.attr('position'))]["sound"] = $(this).attr("value")
            }
          )
        })(block)
      )
    }
  );
}

$(document).ready(function(){
  loadProject('[{"inst":"piano","pos":0,"blocks":[{"name":"piano0","length":1,"sound":"notes/A"}],"color":"pink"},{"inst":"guitar","pos":1,"blocks":[{"name":"guitar0","length":1,"sound":"chords/C"},{"name":"guitar1","length":1,"sound":"chords/F"}],"color":"lightgreen"}]');
  init();
  $(this).keydown(function(e) {
    if(e.which == 8) {
      e.preventDefault();
      let line_pos = parseInt(selected_block.parent('.inst-line').attr('position'));
      let block_pos = parseInt(selected_block.attr('position'));
      arrange_data[line_pos]['blocks'].splice(block_pos, 1);
      selected_block.remove();
    }
  });
})
