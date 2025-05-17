import { LightningElement,track } from 'lwc';
import fetchCases from '@salesforce/apex/caseCustomDatatableController.fetchCases';
import updateCase from '@salesforce/apex/caseCustomDatatableController.updateCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class caseCustomDatatable extends LightningElement {
    loading = false;

    priorityOptions = [
        {label:'Low',value:'Low'},
        {label:'Medium',value:'Medium'},
        {label:'High',value:'High'},
    ];

    statusOptions= [
        {label:'New',value:'New'},
        {label:'Working',value:'Working'},
        {label:'Closed',value:'Closed'},
    ]

    @track cols = [
            {label: 'CaseNumber', fieldName: 'CaseNumber',type:'text',initialWidth:120},
            {label: 'Subject', fieldName: 'Subject', editable: true,initialWidth:240},
            {label: 'Priority', fieldName: 'Priority', type:'picklistColumn', editable: true,initialWidth:160,

                typeAttributes: {
                    placeholder: 'Choose Priority',
                    value: {fieldName: 'Priority'},  
                    options: {fieldName: 'priorityOptions'}, 
                }
            },
            {label: 'Status', fieldName: 'Status', type:'picklistColumn', editable: true,initialWidth:160,

                typeAttributes: {
                    placeholder: 'Choose Status',
                    value: {fieldName: 'Status'},  
                    options: {fieldName: 'statusOptions'}, 
                }
            },
            {label: 'Owner', fieldName: 'ownerName',type:'text',initialWidth:140},
            {label: 'Created', fieldName: 'CreatedDate',type:'date',initialWidth:120},
        ];
    @track cases;
    @track draftValues=[];

    showToast(title,msg,varient) {
        const event = new ShowToastEvent({
            title: title,
            message: msg,
            variant: varient,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    connectedCallback(){
        this.getCases();
    }

    async getCases(){
        this.loading = true;
        await fetchCases()
        .then(result=>{
            const temp = result.map(i=>({
                ...i,
                priorityOptions:this.priorityOptions,
                statusOptions:this.statusOptions,
                ownerName:i.Owner.Name,
            }));
            this.cases = temp;
        })
        .catch(error=>{
            console.log(error);
        })
        .finally(()=>{
            this.loading = false;
        })
    }

    handleCellChange(event){
        const currentDrafts = event.detail.draftValues;
        console.log('current2',currentDrafts);
        this.cases = this.cases.map(c=>{
            const index = currentDrafts.findIndex(dv => dv.Id === c.Id);
            if (index !== -1){
                return {Id: c.Id,...c,...currentDrafts[index]};
            }
            return c;
        })
    }

    async handleSave(event){
        this.loading = true;
        const currentDrafts = event.detail.draftValues;
        console.log('current1',currentDrafts.slice());
        try{
            const result = await updateCase({editedCases:currentDrafts.slice()});
            this.draftValues = [];
            this.showToast('Case(s) updated successfully','','success');
            this.loading = false;
            this.getCases();
        }
        catch(error){
            this.showToast('Error',error.body.message,'error');
            console.log(error);
        }
        finally{
            this.loading = false;
        }
    }
}