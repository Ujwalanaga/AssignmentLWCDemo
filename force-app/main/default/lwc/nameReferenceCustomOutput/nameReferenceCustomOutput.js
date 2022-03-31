import { LightningElement, api } from "lwc";

export default class NameReferenceCustomOutput extends LightningElement {
  @api recordId;
  @api recordName;
  @api value;

  get referenceUrl() {
    let url = "";
    if (this.recordId) {
      url = "/lightning/r/Account/" + this.recordId + "/view";
    }
    return url;
  }
  
  handleClick() {
    const event = new CustomEvent('referenceaction', {
        composed: true,
        bubbles: true,
        cancelable: true,
        detail: {
            recordId: this.recordId,
            recordName: this.recordName
        },
    });
    this.dispatchEvent(event);
  }
}