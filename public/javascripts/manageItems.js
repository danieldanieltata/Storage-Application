$(document).ready(function(){
    
    // Handles the button clicks of the Items 
    $('.item-btn').click(function(){
        var tableRelation = this.id ; 

        $.get('/getItemModelsFromDB?itemId=' + this.id, function(data){
            $('#table-item-models').remove();

            var table = $('<table class="table table-hover" style="position:relative" id="table-item-models">');
            var tableFieldsHead = $('<thead></thead>');
            var tableTrElement = $('<tr></tr>');
            
            tableTrElement.append('<th>#</th>')

            for(let i = 0 ; i < data.responseData.fields.length; i++){
                tableTrElement.append('<th>' + data.responseData.fields[i] + '</th>');
            }
            
            tableFieldsHead.append(tableTrElement);

            table.append(tableFieldsHead);
            table.append('<tbody id="' + tableRelation + '"></tbody>');

            $('#itemModelsTableDiv').append(table);
        }); 

    });

    // Handles the 'Add to table' thing .. when pressing the '+' button
    $('#add-item-to-table').click(function(){
        var newItem = $('<tr></tr>') ;
        var addTableItem = $('#table-item-models>thead>tr');

        newItem.append('<td> <input type="checkbox" name="saveThisRowListener"/> </td>')

        for(let i = 0 ; i < addTableItem.children().length-1; i++){
            newItem.append('<td contenteditable="true">-</td>');
        }

        $('#table-item-models>tbody').append(newItem);
    });

     
    // Handles the 'Add selected items to DB' when pressing the 'V' button 
    $('#add-selected-items-to-db').click(function(){
        var selectedTableItemsArrayJSON = getSelctedTableItemsSelectedByCheckbox();
        //var tableRelation = 

        // Here I'm sending ad diffrent type of request because I have to define that I'm using JSON 
        if(selectedTableItemsArrayJSON.length == 0) return;
        $.ajax({
            type: 'POST',
            url: '/addOrUpdateSelectedTableItems',
            data: JSON.stringify({'selectedTableItemsArrayJSON[]': selectedTableItemsArrayJSON}),
            contentType:"application/json",
            dataType: 'json'
        });

    });
    
    /*
     * @param {JSON} itemModelsFieldsObject will hold the JSON object of the item selected
     * @param {Array} tableHeadersKeysArray will hold the JSON keys in need 
     * @returns {Array} selectedItemsData will hold all the selected rows as JSON in Array
    */
    function getSelctedTableItemsSelectedByCheckbox(){        
        var tableHeadersKeysArray = [];
        var selectedItemsData = [];

        // Getting the Keys of the JSON that we need, it changes per Item table 
        $('#table-item-models>thead>tr').children().each(function(index, th){
            if(th.innerText === '#') return;

            tableHeadersKeysArray.push(th.innerText);    
        });
        
        // Getting the paren of the selected checkbox in order to take the field data 
        var selectedItems = $('input[name=saveThisRowListener]:checked').closest('tr').clone();
        selectedItems.each(function(index, tr){
            itemModelsFieldsObject = {};

            /*
             Copying the Keys Array in order to make the itemModelsFieldsObject JSON, 
             using shift to use as Queue and not Stack
            */
            var tableHeadersKeysArrayCopy = tableHeadersKeysArray.slice();
            $(tr).children().filter('[contenteditable=true]').each(function(index, td){
                itemModelsFieldsObject[tableHeadersKeysArrayCopy.shift()] = $(td).text();
            });
            
            // Putting id if length is bigger then 0, thats tells us that the Item exists in DB 
            if(this.id.length > 0) itemModelsFieldsObject['id'] = this.id ;

            // Pushing JSON to array as copy, because of pass by reference pass by value, in this case its reference
            selectedItemsData.push(JSON.parse(JSON.stringify(itemModelsFieldsObject)));
        });

        return selectedItemsData ;
    }

    // Handles the searching in the table 
    $('#searchInput').keyup(function(){
        var searchInput = $('#searchInput').val().toUpperCase() ;
        var tableItems = $('#table-item-models>tbody>tr');
        
        for(let i = 0; i < tableItems.length; i++){
            if(!tableItems[i].innerText.toUpperCase().includes(searchInput)){
                console.log(tableItems[i].parentNode);
                tableItems[i].classList.add('hide-table-item');
            }
            else{
                tableItems[i].classList.remove('hide-table-item');
            }

        }

    });


    // From here its the section that handles the Modal View('Add Item' section)

    // Handles the 'Add' button 
    $('#AddToModalTableField').click(function(){
        fieldNameInput = $('#tableFieldName').val();

        if(fieldNameInput.length == 0) return ;
        if(fieldNameInput.toUpperCase() == 'AMOUNT'){
            alert('You dont need to add "Amount" its a default field');
            return;
        }
        else if(fieldNameInput.toUpperCase() == 'NAME'){
            alert('Name is not available in this section, you have name in the top section');
            return;
        }
        else if(fieldNameInput.toUpperCase() == 'MODEL NAME' || fieldNameInput.toUpperCase() == 'MODEL-NAME' 
                    || fieldNameInput.toUpperCase() == 'MODEL'){
                             alert('Model name is allready provided !');
                            return;
        }

        itemToAdd = '<p class="list-group-item">' + fieldNameInput + '<span class="removeFieldItemFromList pull-right glyphicon glyphicon-remove" aria-hidden="true"></span></p>'
        $('.tableFieldHolder').append(itemToAdd);

        $('#tableFieldName').val('');
    });

    // Using this kind of listener because this object appends to the DOM after the page was loaded 
    // If adding elements dynamicly ... by code ... you have to use this listener 
    $('.tableFieldHolder').on('click', '.removeFieldItemFromList', function(){
        this.parentNode.remove();
    });

    // Remove all when colosing 
    $('.removeAllWhenClosingModal').click(function(){
        resetAddItemModallElements();
    });

    // Handles the 'Add Item' btn 
    $('#addItemToDB').click(function(){
        var itemName = $('#itemName').val();
        var tableFieldNames = ['Model Name'];

        var tableFieldsHandler = $('.tableFieldHolder>p');
        for(let i = 0; i < tableFieldsHandler.length ; i++){
            tableFieldNames.push(tableFieldsHandler[i].innerText);
        }
        tableFieldNames.push('Amount');

        if(itemName.length == 0 || tableFieldNames.length == 0) {
            alert('You cant input empty form !');
            return false ;
        }
        // Todo, make a layout to add Items to table and then to DB .

        $.post('/postNewItemToDB', {name: itemName, tablesFields: tableFieldNames})
                .done(function(res){
                    
                    if(res.status == 200){
                        windows.location.replace('/');
                    }
                    else{
                        alert('This item name is already in use !');
                    }

                });

        resetAddItemModallElements();
        $('#addItemModal').modal('hide')
    });

    function resetAddItemModallElements(){
        $('.tableFieldHolder>p').remove();
        $('#itemName').val('');
        $('#tableFieldName').val('');
    }

});