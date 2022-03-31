import LightningDatatable from "lightning/datatable";
import referenceTemplate from "./referenceTemplate.html";
import referenceCustomActionTemplate from "./referenceTemplateCustom.html";

export default class CustomDatatable extends LightningDatatable {
  static customTypes = {
    referenceName: {
      template: referenceTemplate,
      standardCellLayout: true,
      typeAttributes: ["recordId", "recordName", "sObjectName"]
    },
    referenceCustomAction: {
      template: referenceCustomActionTemplate,
      standardCellLayout: true,
      typeAttributes: ["recordId", "recordName"]
    }
  };
}