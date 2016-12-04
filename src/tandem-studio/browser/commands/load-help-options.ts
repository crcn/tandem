import { BaseStudioEditorBrowserCommand } from "./base";
import { GetHelpOptionsRequest } from "tandem-studio/common/messages";

export class LoadHelpOptionsCommad extends BaseStudioEditorBrowserCommand {
  async execute() {
    this.studioEditorStore.helpOptions = await GetHelpOptionsRequest.dispatch(this.bus);
  }
}