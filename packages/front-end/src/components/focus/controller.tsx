import * as React from "react";
import { FocusComponent } from "./index";

export default (Base: React.ComponentClass<any>) =>
  class FocusController extends React.PureComponent<any> {
    render() {
      return (
        <FocusComponent {...this.props}>
          <Base {...this.props} />
        </FocusComponent>
      );
    }
  };
