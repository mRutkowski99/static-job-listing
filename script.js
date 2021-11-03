const filterContainer = document.querySelector('.filter')
const filterList = document.querySelector('.filter__list')
const offersContainer = document.querySelector('.offers-container')

class Model {
    constructor() {
        this.offersArr = []
        this.filtersArr = []
    }

    async fetchData() {
        const request = await fetch('data.json')
        this.offersArr = await request.json()
    }

    addFilter(filter) {
        if (!this.filtersArr.includes(filter)) this.filtersArr.push(filter)
    }

    removeFilter(filter) {
        this.filtersArr = this.filtersArr.filter(el => el !== filter)
    }

    clearFilters() {
        this.filtersArr = []
    }
}

class View {
    constructor() {
    }

    displayFiltersList(filters) {
        filters.length === 0 ? filterContainer.classList.add('hidden') : filterContainer.classList.remove('hidden')
    }

    displayFilters(filters) {
        filterList.innerHTML = ''
        filters.forEach(filter => {
            filterList.innerHTML += `
            <li class="filter__item">
                <span class="filter__selected">${filter}</span>
                <div class="filter__remove"><img class="filter__remove-icon" src="images/icon-remove.svg" alt="Remove icon"></div>
            </li>`
        })
    }

    displayOffers(offers, filters) {
        offersContainer.querySelectorAll('.offer').forEach(el => el.remove())

        offers.forEach(offer => {
            //Gather attached filters from offer in one array and create unordered list with them so all them could be inserted to 
            //div with job offer
            const offerFilters = [offer.role, offer.level, ...offer.languages, ...offer.tools]
            const offersHtml = document.createElement('ul')
            offersHtml.classList.add('offer__filters-list')
            offerFilters.forEach(el => offersHtml.insertAdjacentHTML('afterbegin', `<li class="offer__filter">${el}</li>`))
            
            //If no filter was chosen all offers match and could be dispalyed
            //If there is some filters activated display only offers which fulfill all of them
            if (filters.length === 0 || (filters.length !== 0 && filters.every(el => offerFilters.includes(el)))) {
                const html = `
                    <div class="offer ${offer.featured ? 'offer--featured' : ''}">
                        <div class="offer__company-logo">
                            <img src="${offer.logo}" alt="${offer.company} logo">
                        </div>
            
                        <div class="offer__details">
                            <div>
                                <h2 class="offer__company-name">${offer.company}</h2>
                                ${offer.new ? '<span class="offer__tag offer__tag--new">New!</span>' : ''}
                                ${offer.featured ? '<span class="offer__tag offer__tag--featured">Featured</span>' : ''}
                            </div>
            
                            <h1 class="offer__position">${offer.position}</h1>
            
                            <ul class="offer__info">
                                <li>${offer.postedAt}</li>
                                <li>${offer.contract}</li>
                                <li>${offer.location}</li>
                            </ul>
                        </div>

                        ${offersHtml.outerHTML}
                    </div>`
                offersContainer.insertAdjacentHTML('beforeend', html)
            }
        })
    }
}

class Controler {
    constructor(model, view) {
        this.model = model
        this.view = view;

        //Display initial page with all elements. Data is fetched asynchronously so it must be wrapped in async function
        (async () => {
            await this.model.fetchData()
            this.view.displayOffers(this.model.offersArr, this.model.filtersArr)
        })()

        filterContainer.addEventListener('click', this._filtersContainerHandler.bind(this))
        offersContainer.addEventListener('click', this._offersContainerHandler.bind(this))
    }

    _updateUI() {
        this.view.displayFiltersList(this.model.filtersArr)
        this.view.displayFilters(this.model.filtersArr)
        this.view.displayOffers(this.model.offersArr, this.model.filtersArr)
    }

    _filtersContainerHandler(e) {
        if (e.target.closest('.filter__remove')) {
            const removedFilter = e.target.closest('.filter__item').querySelector('.filter__selected').innerText
            this.model.removeFilter(removedFilter)
            this._updateUI()
        }

        if (e.target.classList.contains('filter__clear')) {
            this.model.clearFilters()
            this._updateUI()
        }
    }

    _offersContainerHandler(e) {
        if (!e.target.classList.contains('offer__filter')) return
        
        this.model.addFilter(e.target.innerText)
        this._updateUI()
    }
}

const app = new Controler(new Model(), new View())
