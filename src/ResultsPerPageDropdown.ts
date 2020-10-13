import { Component, Dom, LazyInitialization, load, l, IComponentDefinition, ResultsPerPage, IComponentBindings, ComponentOptions, DeviceUtils, IResultsPerPageOptions, $$ } from 'coveo-search-ui';
import { lazyComponent } from '@coveops/turbo-core';

export interface IResultsPerPageDropdownOptions {
    choicesDisplayed?: number[];
    initialChoice?: number;
    caption?: string;
    displayCaption?: boolean;
}

/**
* The `ResultsPerPageDropdown` component renders a dropdown that the end user can interact with to select the criteria to to choose how many results to
* display per page.
*
* **Note:** Adding a ResultsPerPageDropdown component to your page overrides the value of
* {@link SearchInterface.options.resultsPerPage}.
*/
@lazyComponent
export class ResultsPerPageDropdown extends Component {
    static ID = 'ResultsPerPageDropdown';
    static options: IResultsPerPageDropdownOptions = {
        caption: ComponentOptions.buildLocalizedStringOption({ localizedString: () => l('ResultsPerPage'), depend: 'displayCaption' }),
        displayCaption: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        /**
         * Specifies the possible values of number of results to display per page that the end user can select from.
         *
         * See also {@link ResultsPerPage.options.initialChoice}.
         *
         * Default value is `[10, 25, 50, 100]`.
         */
        choicesDisplayed: ComponentOptions.buildCustomListOption<number[]>(
            function(list: string[]) {
              const values = _.map(list, function(value) {
                return parseInt(value, 10);
              });
              return values.length == 0 ? null : values;
            },
            {
              defaultFunction: () => {
                if (DeviceUtils.isMobileDevice()) {
                  return [10, 25, 50];
                } else {
                  return [10, 25, 50, 100];
                }
              }
            }
          ),
          /**
           * Specifies the value to select by default for the number of results to display per page.
           *
           * Default value is the first value of {@link ResultsPerPage.options.choicesDisplayed}.
           */
          initialChoice: ComponentOptions.buildNumberOption()
    };

    private resultsPerPage: ResultsPerPage;
    // private selectOptions: Array<ICustomOption>;
    private select: HTMLSelectElement;
    private selectStyled: Dom;
    private listOptions: Dom;
    
    constructor(public element: HTMLElement, public options: IResultsPerPageDropdownOptions, public bindings: IComponentBindings) {
        super(element, ResultsPerPageDropdown.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, ResultsPerPageDropdown, options);

        this.select = this.getSelectElement();
        $$(this.select).addClass('coveo-custom-select-hidden');

        const resultsPerPageDom = $$('div');
        this.element.appendChild(resultsPerPageDom.el);

        const resultsPerPageOption : IResultsPerPageOptions = {
            initialChoice: this.options.initialChoice,
            choicesDisplayed: this.options.choicesDisplayed
        }
        const promiseResultsPerPage = new Promise<ResultsPerPage>((resolve, reject) => {
            if(LazyInitialization){
                load<IComponentDefinition>('ResultsPerPage').then((ResultsPerPage:any) => { 
                    resolve(new ResultsPerPage(resultsPerPageDom.el, resultsPerPageOption, bindings))
                })
            } else {
                resolve(new ResultsPerPage(resultsPerPageDom.el, resultsPerPageOption, bindings));
            }
        });

        this.buildSelectStyled();

        promiseResultsPerPage.then(component => {
            this.resultsPerPage = component;
            this.resultsPerPage.disable();
            $$(this.resultsPerPage.element).hide();
            this.renderSelectStyled();
            this.selectOptionAction(this.getSelectedOption());
        });
    }

    private getSelectElement() {
      let selectEl = <HTMLSelectElement>(this.element instanceof HTMLSelectElement ? this.element : $$(this.element).find('select'));
      if (!selectEl) {
        selectEl = <HTMLSelectElement>$$('select').el;
        this.element.appendChild(selectEl);
      }
      return selectEl;
    }

    private buildCaptionElement() {
        return $$('span', { className: 'coveo-resultsperpage-dropdown-caption'}, this.options.caption).el;
    }

    private buildSelectStyled() {
      // create wrapper container
      const wrapper = $$('div', { className: 'coveo-custom-select' });
      // insert wrapper before select element in the DOM tree
      this.select.parentNode.insertBefore(wrapper.el, this.select);
      // move select into wrapper
      wrapper.append(this.select);

      if(this.options.displayCaption){
          this.element.insertBefore(this.buildCaptionElement(), wrapper.el)
      }

      this.selectStyled = $$('div', { className: 'coveo-custom-select-styled' });
      this.listOptions = $$('ul', { className: 'coveo-custom-select-options' });

      wrapper.append(this.selectStyled.el);
      wrapper.append(this.listOptions.el);

      this.renderSelectStyled();

      this.selectStyled.on('click', (e) => {
        e.stopPropagation();
        this.selectStyled.toggleClass('active')
        this.listOptions.toggle();
      });

      document.addEventListener('click', () => {
        this.selectStyled.removeClass('active');
        this.listOptions.hide();
      });
    }

    private renderSelectStyled() {

      const self = this;
      this.listOptions.empty();

      if (!this.select.options.length) {
        this.buildSelectOptions();
      }

      const nbResults = Coveo.HashUtils.getValue('numberOfResults', Coveo.HashUtils.getHash());
      const current = nbResults ? nbResults : (this.select.options.length ? this.select.options[this.select.selectedIndex].text : '');
      this.selectStyled.text(current);

      for (var i = 0; i < this.select.options.length; i++) {
        const listItem = $$('li', {
          value: this.select.options.item(i).value
        }, this.select.options.item(i).text);
        this.listOptions.append(listItem.el);

        if (current == this.select.options.item(i).text) {
          listItem.addClass('active');
        }
        listItem.on('click', (e) => {
          e.stopPropagation();
          self.select.value = listItem.getAttribute('value');
          self.selectOptionAction(self.getSelectedOption());
          self.selectStyled.text(listItem.text())
          self.selectStyled.removeClass('active');
          _.each(self.listOptions.children(), (li) => { $$(li).removeClass('active'); });
          listItem.addClass('active');
          self.listOptions.hide();
        });
      }
    }

    private buildSelectOptions() {
      $$(this.select).empty();
      this.options.choicesDisplayed.forEach((o) => {
        const selectOptionEl = <HTMLOptionElement>$$('option', {
            value: o,
          }, o.toString()).el;
          if (this.options.initialChoice === o) {
            selectOptionEl.selected = true;
          }
          $$(this.select).append(selectOptionEl);
      })
    }
    public getSelectedOption() {
      return this.select.options[this.select.selectedIndex].value;
      // if(this.select.selectedIndex) {
      //   return this.select.options[this.select.selectedIndex].value;
      // } else {
      //   return Coveo.HashUtils.getValue('numberOfResults', Coveo.HashUtils.getHash());
      // }
      
    }
    public setSelectedOption(value: string) {
      let nextSelectedIndex = _.findIndex(this.select.options, (o)=>{
        return o.value === value;
      });
      if(nextSelectedIndex >= 0){
        this.select.value = this.select.options[nextSelectedIndex].value;
        this.selectOptionAction(this.getSelectedOption());
        this.selectStyled.text(this.select.options[nextSelectedIndex].text)
        this.selectStyled.removeClass('active');
      }
    }

    private selectOptionAction(value:string) {
      if(this.queryController.firstQuery){
        this.searchInterface.resultsPerPage = (Number(value));
      } else {
        this.resultsPerPage.setResultsPerPage(Number(value));
      }
    }
}