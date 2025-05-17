import LightningDatatable from 'lightning/datatable';
import picklistTemplate from './picklistTemplate.html';
import picklistStaticTemplate from './picklistStaticTemplate.html';

export default class customDatatable extends LightningDatatable {
    static customTypes = {
        picklistColumn: {
            template: picklistStaticTemplate,
            editTemplate: picklistTemplate,
            standardCellLayout: true,
            typeAttributes: ['placeholder', 'options','value']
        }
    };
}