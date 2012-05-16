define(["jquery", "comm", "./dungeon_renderer", "./tileinfo-gui", "./map_knowledge",
        "./enums"],
function ($, comm, dr, gui, map_knowledge, enums) {
    function handle_cell_click(ev)
    {
        if (ev.which == 1) // Left click
        {
            comm.send_message("click_travel", {
                x: ev.cell.x,
                y: ev.cell.y
            });
        }
        else if (ev.which == 3) // Right click
        {
        }
    }

    function show_context_menu(x, y, spec)
    {
        var contents = $("<ol>");
        $.each(spec, function (i, s) {
            if (s)
                contents.append(create_menu_item(s));
        });

        var menu = $("#context_menu");

        menu
            .html(contents)
            .css({ left: 0, top: 0 })
            .show();

        if (menu.outerWidth(true) + x > $(window).width())
        {
            // Show to the left of the cursor
            x -= menu.outerWidth(true);
        }

        $("#context_menu").css({ left: x, top: y });
    }

    function hide_context_menu()
    {
        $("#context_menu").hide();
    }

    function create_menu_item(spec)
    {
        var item = $("<li>");
        if (spec.tiletex === undefined)
            spec.tiletex = enums.texture.GUI;
        item.append(create_menu_icon(spec.tile, spec.tiletex));
        item.append($("<span>" + spec.text + "</span>"));
        item.on("mouseup", function (ev) {
            spec.onselect.call(spec);
        });
        return item;
    }

    function create_menu_icon(t, tex)
    {
        var renderer = dr.new_renderer([{tex: tex,
                                         t: t}]);
        $(renderer.element).css("vertical-align", "middle");
        return $(renderer.element);
    }


    function show_tooltip(text, x, y)
    {
        $("#tooltip")
            .html(text)
            .css({ left: x, top: y })
            .show();
    }

    function hide_tooltip()
    {
        $("#tooltip").hide();
    }

    function handle_cell_tooltip(ev)
    {
        var map_cell = map_knowledge.get(ev.cell.x, ev.cell.y);

        var c = map_cell.x + "/" + map_cell.y + "<br>";

        var mf = "undefined";

        for (var entry in enums.map_feature)
        {
            if (enums.map_feature[entry] == map_cell.mf)
            {
                mf = entry;
                break;
            }
        }
        c += "MF: " + mf + "<br>";

        show_tooltip(c, ev.pageX + 10, ev.pageY + 10);
    }


    $(document)
        .off("game_init.mouse_control")
        .on("game_init.mouse_control", function () {
            $("#dungeon")
                .on("cell_click", handle_cell_click)
                .on("cell_tooltip", handle_cell_tooltip);
            $("#context_menu").on("contextmenu",
                                  function (ev) { ev.preventDefault() });
        });
    $(window)
        .off("mouseup.mouse_control mousemove.mouse_control mousedown.mouse_control")
        .on("mouseup.mouse_control", function (ev) {
            hide_context_menu();
        })
        .on("mousemove.mouse_control mousedown.mouse_control", function (ev) {
            hide_tooltip();
        });

    return {
        show_context_menu: show_context_menu,
        hide_context_menu: hide_context_menu,
        show_tooltip: show_tooltip,
        hide_tooltip: hide_tooltip
    };
});