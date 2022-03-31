import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class NameReferenceOutput extends NavigationMixin(
  LightningElement
)  {
  @api recordId;
  @api recordName;
  @api
  get sObjectName() {
    return this._sObjectName;
  }
  set sObjectName(value) {
    if (value) {
      this.sObjectId = value.Id;
      this._sObjectName = value;
    }
  }
  @api value;
  sObjectId;
  _sObjectName;

  referenceUrl;

  @wire(getRecord, { recordId: "$sObjectId", layoutTypes: ["Full"] })
  wiredRecordInfo({ error, data }) {
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
      this.referenceUrl = url;
    });
  }
}