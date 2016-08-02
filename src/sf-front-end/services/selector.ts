import { IEntity } from "sf-core/entities";
import { BaseApplicationService } from "sf-core/services";
import { ApplicationServiceDependency } from "sf-core/dependencies";
import { loggable, bindable, isPublic } from "sf-core/decorators";

import { FrontEndApplication } from "sf-front-end/application";
import { SelectionFactoryDependency } from "sf-front-end/dependencies";

@loggable()
export default class SelectorService extends BaseApplicationService<FrontEndApplication> {

  @isPublic
  selectAtSourceOffset({ data }) {

    const allEntities = <Array<IEntity>>this.app.editor.file.entity.flatten();

    const selection = [];
    for (const entity of allEntities) {
      if (entity["display"]) {
        const position = entity.expression.position;
        for (const cursor of data) {

          if (
            (cursor.start >= position.start && cursor.start <= position.end) ||
            (cursor.end   >= position.start && cursor.end <= position.end) ||
            (cursor.start <= position.start && cursor.end >= position.end)
          ) {

            const parentIndex = selection.indexOf(entity.parentNode);

            if (parentIndex > -1) {
              selection.splice(parentIndex, 1);
            }

            selection.push(entity);
          }

        }
      }
    }


    this.select({
      items: selection,
      toggle: false,
      keepPreviousSelection: false
    });
  }

  /**
   */

  select({ items, toggle, keepPreviousSelection }) {
    const app = this.app;

    if (!items.length) {
      return app.editor.selection = [];
    }

    const prevSelection = app.editor.selection;

    const type = items[0].type;

    const newSelectionDependency = SelectionFactoryDependency.find(type, this.app.dependencies);
    const newSelection = newSelectionDependency ? newSelectionDependency.create() : [];

    if (keepPreviousSelection && newSelection.constructor === prevSelection.constructor) {
      newSelection.push(...prevSelection);
    } else {
      newSelection.push(...prevSelection.filter((item) => !!~items.indexOf(item)));
    }

    for (const item of items) {
      const i = newSelection.indexOf(item);
      if (~i) {
        if (toggle) {
          newSelection.splice(i, 1);
        }
      } else {
        newSelection.push(item);
      }
    }

    app.editor.selection = newSelection;

    app.bus.execute({ type: 'change' });
  }
}

export const dependency = new ApplicationServiceDependency("selector", SelectorService);