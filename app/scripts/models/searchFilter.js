/*global PreLinked, Backbone*/

PreLinked.Models.SearchfilterModel = Backbone.Model.extend({

  initialize: function() {
    this.jobQuery = PreLinked.jobQuery;
    this.regexTrimHeadTailSpace = /^[ \t]+|[ \t]+$/;
  },

  splitFilter: function(word) {
    if(_.contains(word, '_')) {
      word = word.replace('_',' ');
      return this.splitFilter(word);
    } else {
      return word;
    }
  },

  addSearchFilter: function(title, company, keywords, distance, minSalary, maxSalary) {
    var temp = [];
    if(title && !this.jobQuery.isDuplicateFilter('jobTitle', title)) {
      title = title.replace(this.regexTrimHeadTailSpace, "");
      temp = this.jobQuery.attributes.jobTitle.slice();
      temp.push(title);
      this.jobQuery.set('jobTitle', temp);
    }
    if(company && !this.jobQuery.isDuplicateFilter('company', company)) {
      company = company.replace(this.regexTrimHeadTailSpace, "");
      temp = this.jobQuery.attributes.company.slice();
      temp.push(company);
      this.jobQuery.set('company', temp);
    }
    if(keywords && !this.jobQuery.isDuplicateFilter('jobKeywords', keywords)) {
      keywords = keywords.replace(this.regexTrimHeadTailSpace, "");
      temp = this.jobQuery.attributes.jobKeywords.slice();
      temp.push(keywords);
      this.jobQuery.set('jobKeywords', temp);
    }
    if(distance !== this.jobQuery.attributes.distance){
      this.jobQuery.set('distance', distance);
    }
    if(minSalary !== this.jobQuery.attributes.minSalary) {
      this.jobQuery.set('minSalary', minSalary);
    }
    if(maxSalary !== this.jobQuery.attributes.maxSalary) {
      this.jobQuery.set('maxSalary', maxSalary);
    }
  },

  removeSearchFilter: function(e) {
    var filterType = e.target.className.split(' ')[1];
    var elToRemove = this.splitFilter(e.target.className.split(' ')[2]);
    var indexToRemove = 0;
    if(filterType === 'removeJobTitleFilter') {
      var jobTitleArray = this.jobQuery.get('jobTitle').slice();
      indexToRemove = _.indexOf(jobTitleArray, elToRemove);
      jobTitleArray.splice(indexToRemove, 1);
      this.jobQuery.set('jobTitle', jobTitleArray);
    } else if(filterType === 'removeCompanyFilter') {
      var companyArray = this.jobQuery.get('company').slice();
      indexToRemove = _.indexOf(companyArray, elToRemove);
      companyArray.splice(indexToRemove, 1);
      this.jobQuery.set('company', companyArray);
    } else if(filterType === 'removeJobLocationFilter') {
      this.jobQuery.set('jobLocation', '');
    } else if(filterType === 'removeJobKeywordsFilter') {
      var jobKeywordsArray = this.jobQuery.get('jobKeywords').slice();
      indexToRemove = _.indexOf(jobKeywordsArray, elToRemove);
      jobKeywordsArray.splice(indexToRemove, 1);
      this.jobQuery.set('jobKeywords', jobKeywordsArray);
    }
  }
});
