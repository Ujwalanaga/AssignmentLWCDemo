import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAccounts from '@salesforce/apex/GetAccountDetails.getAccounts';
import saveRecords from '@salesforce/apex/GetAccountDetails.saveRecords';
import { NavigationMixin } from "lightning/navigation";
import { getRecord } from "lightning/uiRecordApi";

const columns = [{
    label: 'Name',
    fieldName: 'Name',
    sortable: true,
    type: 'referenceCustomAction',
    typeAttributes: {
        recordName: {
            fieldName: 'Name'
        },
        recordId: {
            fieldName: 'Id'
        },
        sObjectName: {
            fieldName: 'Account'
        },
        fieldApiName: {
            fieldName: 'Name'
        }
    }
},
{
    label: 'Owner',
    fieldName: 'OwnerId',
    sortable: true,
    type: 'referenceName',
    typeAttributes: {
        recordName: {
            fieldName: 'Name'
        },
        recordId: {
            fieldName: 'Id'
        },
        sObjectName: {
            fieldName: 'Owner'
        },
        fieldApiName: {
            fieldName: 'OwnerId'
        }
    }
},
{
    label: 'Phone',
    fieldName: 'Phone',
    sortable: false,
    editable: true
},
{
    label: 'Website',
    fieldName: 'Website',
    sortable: false,
    editable: true
},
{
    label: 'Annual Revenue',
    fieldName: 'AnnualRevenue',
    editable: true,
    sortable: false
}
];

export default class AccountDetails extends NavigationMixin(
    LightningElement
) {
    @track value;
    @track error;
    @track data;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';
    result;
    @track allSelectedRows = [];
    @track page = 1;
    @track items = [];
    @track data = [];
    @track draftValues = [];
    @track columns;
    @track startingRecord = 1;
    @track endingRecord = 0;
    @track pageSize = 5;
    @track totalRecountCount = 0;
    @track totalPage = 0;
    @track selectedRecordId;
    isPageChanged = false;
    initialLoad = true;
    mapoppNameVsOpp = new Map();

    @wire(getAccounts, { searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection' })
    wiredAccounts({ error, data }) {
        if (data) {
            this.processRecords(data);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }



    fetchAccountRecords() {
        getAccounts({
            searchKey: this.searchKey,
            sortBy: this.sortedBy,
            sortDirection: this.sortDirection
        }).then(data => {
            this.processRecords(data);
            this.error = undefined;
        })  .catch(error => {
            this.error = error;
        });
    }

    processRecords(data) {
        this.items = data;
        this.totalRecountCount = data.length;
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);

        this.data = this.items.slice(0, this.pageSize);
        this.endingRecord = this.pageSize;
        this.columns = columns;
    }
    //clicking on previous button this method will be called
    previousHandler() {
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
        var selectedIds = [];
        for (var i = 0; i < this.allSelectedRows.length; i++) {
            selectedIds.push(this.allSelectedRows[i].Id);
        }
        this.template.querySelector(
            '[data-id="table"]'
        ).selectedRows = selectedIds;
    }

    //clicking on next button this method will be called
    nextHandler() {
        this.isPageChanged = true;
        if ((this.page < this.totalPage) && this.page !== this.totalPage) {
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);
        }
        var selectedIds = [];
        for (var i = 0; i < this.allSelectedRows.length; i++) {
            selectedIds.push(this.allSelectedRows[i].Id);
        }
        this.template.querySelector(
            '[data-id="table"]'
        ).selectedRows = selectedIds;
    }

    //this method displays records page by page
    displayRecordPerPage(page) {

        this.startingRecord = ((page - 1) * this.pageSize);
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount)
            ? this.totalRecountCount : this.endingRecord;

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }

    sortColumns(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return refreshApex(this.result);

    }

    onRowSelection(event) {
        if (!this.isPageChanged || this.initialLoad) {
            if (this.initialLoad) this.initialLoad = false;
            this.processSelectedRows(event.detail.selectedRows);
        } else {
            this.isPageChanged = false;
            this.initialLoad = true;
        }

    }
    processSelectedRows(selectedOpps) {
        var newMap = new Map();
        for (var i = 0; i < selectedOpps.length; i++) {
            if (!this.allSelectedRows.includes(selectedOpps[i])) {
                this.allSelectedRows.push(selectedOpps[i]);
            }
            this.mapoppNameVsOpp.set(selectedOpps[i].Name, selectedOpps[i]);
            newMap.set(selectedOpps[i].Name, selectedOpps[i]);
        }
        for (let [key, value] of this.mapoppNameVsOpp.entries()) {
            if (newMap.size <= 0 || (!newMap.has(key) && this.initialLoad)) {
                const index = this.allSelectedRows.indexOf(value);
                if (index > -1) {
                    this.allSelectedRows.splice(index, 1);
                }
            }
        }
    }

    handleKeyChange(event) {
        this.searchKey = event.target.value;
        var data = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i] != undefined && this.items[i].Name.includes(this.searchKey)) {
                data.push(this.items[i]);
            }
        }
        this.processRecords(data);
    }


    handleReferenceAction(event) {
        let { recordId, recordName } = event.detail;
        if (recordId) {
            this.selectedRecordId = recordId;
        }
    }

    @wire(getRecord, { recordId: "$selectedRecordId", layoutTypes: ["Full"] })
    wiredRecord({ error, data }) {
        if (error) {
            let message = "Unknown error";
            if (Array.isArray(error.body)) {
                message = error.body.map((e) => e.message).join(", ");
            } else if (typeof error.body.message === "string") {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error loading",
                    message,
                    variant: "error"
                })
            );
        } else if (data) {
            this.navigateToRecordDetailPage(data.apiName, data.id);
        }
    }

    navigateToRecordDetailPage(sObjectName, recordId) {
        // Navigate to the Contact object's Recent list view.
        this[NavigationMixin.GenerateUrl]({
            type: "standard__recordPage",
            attributes: {
                recordId: recordId,
                objectApiName: sObjectName,
                actionName: "view"
            }
        }).then((url) => {
            window.open(url, "_blank");
        });
    }

    handleSave(event) {
       const draftValue = event.detail.draftValues;
        saveRecords({
            listOfAccount: draftValue
        })
        .then(data => {
            this.fetchAccountRecords();
            this.items = [];
            this.draftValues = [];
        }).catch(error => {
            this.error = error;
        })
    }
}