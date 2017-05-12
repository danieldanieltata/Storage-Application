$(document).ready(function(){
    
    // Handles the button clicks of the Items 
    $('.item-btn').click(function(){
        var tableRelation = this.id ; 
        var table = $('#table-item-models');
        
        var tableFieldsHead = $('<thead></thead>');
        var tableBody = $('<tbody id="' + tableRelation + '"></tbody>');

        table.empty().promise().done(function(){
            $.get('/getItemModelsFromDB?itemId=' + tableRelation).done(function(data){

                    
                    var tableTrElement = $('<tr></tr>');
                    
                    tableTrElement.append('<th>#</th>')

                    for(let i = 0 ; i < data.responseData.fields.length; i++){
                        tableTrElement.append('<th>' + data.responseData.fields[i] + '</th>');
                    }
                    
                    tableFieldsHead.append(tableTrElement);
                    for(let i = 0 ; i < data.responseData.itemModels.length; i++){
                        let tableRow  = $('<tr></tr>');
                        let itemModel = data.responseData.itemModels[i];
                        let itemModelKeys = Object.keys(itemModel.customFieldsInputs);

                        tableRow.attr('id', itemModel._id).promise().done(function(){


                            tableRow.append('<td class="checkbox-select-item"> <input type="checkbox" name="saveThisRowListener"/> </td>');
                            tableRow.append('<td><div contenteditable>' + itemModel.name + '</div></td>');
                            for(let j = 0 ; j < itemModelKeys.length; j++){
                                tableRow.append('<td><div contenteditable>'
                                                    + itemModel.customFieldsInputs[ itemModelKeys[j] ] + '</div></td>');
                            }

                            tableRow.append('<td><div contenteditable>' + itemModel.amount + '</div></td>');

                        }).done( tableBody.append(tableRow) );
                        
                    }
                    

                }).done( table.append(tableFieldsHead).promise().done( table.append(tableBody) ) );

        });

    });

    // Handles the 'Add to table' thing .. when pressing the '+' button
    $('#add-item-to-table').click(function(){
        var newItem = $('<tr></tr>') ;
        var addTableItem = $('#table-item-models>thead>tr');

        newItem.append('<td class="checkbox-select-item"> <input type="checkbox" name="saveThisRowListener"/> </td>')

        for(let i = 0 ; i < addTableItem.children().length-1; i++){
            newItem.append('<td><div contenteditable>-</div></td>');
        }

        $('#table-item-models>tbody').append(newItem);
    });

     
    // Handles the 'Add selected items to DB' when pressing the 'V' button 
    $('#add-selected-items-to-db').click(function(){
        var selectedTableItemsArrayJSON = getSelctedTableItemsSelectedByCheckbox();
        var itemTableRelation = $('#table-item-models>tbody').attr('id');

        // Here I'm sending ad diffrent type of request because I have to define that I'm using JSON 
        if(selectedTableItemsArrayJSON.length == 0) return;
        $.ajax({
            type: 'POST',
            url: '/addOrUpdateSelectedTableItems',
            data: JSON.stringify({'selectedTableItemsArrayJSON[]': selectedTableItemsArrayJSON,
                                         'itemTableRelation': itemTableRelation}),
            contentType:"application/json",
            dataType: 'json'
        })

    });

    //Handles the 'Remove selected items from DB' when prssing the 'X' button
    $('#remove-selected-items-from-db').click(function(){
        
        var selectedTableItemsArrayJSON = getSelctedTableItemsSelectedByCheckbox();
        var filteredTableItemsArrayJSON = [];
        var itemTableRelation = $('#table-item-models>tbody').attr('id');

        $.when().then(function(){
            while(selectedTableItemsArrayJSON.length > 0){
                let possibleIditem = selectedTableItemsArrayJSON.pop() ;
                if(possibleIditem.id) filteredTableItemsArrayJSON.push(possibleIditem);
            }

            $('input[name=saveThisRowListener]:checked').closest('tr').each(function(index, tr){
                if(this.id.length === 0) $(this).remove();
            });
        }).then(function(){
            if(filteredTableItemsArrayJSON.length === 0) return ; 
            $.ajax({
            type: 'POST',
            url: '/removeSelectedTableItems',
            data: JSON.stringify({'filteredTableItemsArrayJSON[]': filteredTableItemsArrayJSON,
                                         'itemTableRelation': itemTableRelation}),
            contentType:"application/json",
            dataType: 'json'
            })
        
        });


    });

    $('#i-took-items').click(function(){
        var selectedTableItemsArrayJSON = getSelctedTableItemsSelectedByCheckbox();
        var filteredTableItemsArrayJSON = [];
        var itemTableRelation = $('#table-item-models>tbody').attr('id');

        if(selectedTableItemsArrayJSON.length === 0) return ;

        var tableFilteredBodyForModal =  $('<tbody></tbody>');
        var tableHeading = $('#table-item-models>thead').clone();

        tableHeading.find('tr').append('<th>I took</th>');
        $($(tableHeading.children()[0]).children()[0]).remove(); // tbody --> tr --> td's
        $.when( promissedFilterTableItemsArrayJsonLoop() ).done(function(){

            $('input[name=saveThisRowListener]:checked').closest('tr').each(function(index, tr){
               
                if(tr.id.length > 0){ 

                    var tableRow =  $(tr).clone();
                    $(tableRow.children()[0]).remove()
                    tableRow.append('<td> <input class="amount-i-took-holder" type="number" placeholder="Amount" /> </td>');

                    tableFilteredBodyForModal.append( tableRow );
                } 

            });

            
        })
        .done(function(){
            $('#iTookItemModal').modal('show');
            
            console.log(tableHeading);
            $('#i-took-this-item-table').append(tableHeading);
            $('#i-took-this-item-table').append(tableFilteredBodyForModal);
        });
        



        function promissedFilterTableItemsArrayJsonLoop(){
            var deferred = new $.Deferred();
            while(selectedTableItemsArrayJSON.length > 0){
                let possibleIditem = selectedTableItemsArrayJSON.pop() ;
                if(possibleIditem.id) filteredTableItemsArrayJSON.push(possibleIditem);
            }
            if(selectedTableItemsArrayJSON.length === 0) deferred.resolve();

            return deferred.promise();
        }

    });

    $('#update-amount-in-db').click(function(){

        var itemsToUpdateArray = [];
        $.when( prommiseCheckIfInputsAreValidNumber(status) )
        .done(function(){
            console.log(status);
            if(status === false) return; 
            $('.amount-i-took-holder').each(function(index, input){
                let jqueryObjInput = $(input);
                let inputParent    = jqueryObjInput.closest('tr')[0]

                let item = {
                    'inputValue'  : jqueryObjInput.val(),
                    'parentID'    : inputParent.id
                };

                itemsToUpdateArray.push(item);  
            });


        })
        .done(function(){
            console.log(itemsToUpdateArray);

            $.ajax({
                type: 'POST',
                url: '/updateAmountOfModels',
                data: JSON.stringify({'itemsToUpdateArray[]': itemsToUpdateArray}),
                contentType:"application/json",
                dataType: 'json'
            })
            .done(function(){
                return;
            });

        });


        function prommiseCheckIfInputsAreValidNumber(){
            $('#modal-i-took-item-body').find('div.alert-danger').remove()

            var deferred = new $.Deferred();

            var inputsValues =  $('.amount-i-took-holder') ;
            var count = 0 ;

            for(let i = 0 ; i < inputsValues.length ; i++){
                inputValue = $( inputsValues[i] ).val() ;

                if( inputValue.length === 0 ){
                    let alert = '<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Error!</strong> Some of the amounts are incorrect.</div>'
                    $('#modal-i-took-item-body').append(alert);

                    deferred.reject('alse');
                    return;
                }

                count++;
            }

            if(inputsValues.length === count) deferred.resolve();

            return deferred.promise();
        }
    });

    $("#iTookItemModal").on("hidden.bs.modal", function(){
        $("#i-took-this-item-table").html("");
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
        
        // Getting the parent of the selected checkbox in order to take the field data 
        var selectedItems = $('input[name=saveThisRowListener]:checked').closest('tr').clone();
        selectedItems.each(function(index, tr){
            itemModelsFieldsObject = {};

            /*
             Copying the Keys Array in order to make the itemModelsFieldsObject JSON, 
             using shift to use as Queue and not Stack
            */
            var tableHeadersKeysArrayCopy = tableHeadersKeysArray.slice();
            $(tr).children().not('.checkbox-select-item').each(function(index, td){
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
            if(!tableItems[i].innerText.toUpperCase().match(searchInput)){
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