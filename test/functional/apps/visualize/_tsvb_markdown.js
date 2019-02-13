/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import expect from 'expect.js';

export default function ({ getService, getPageObjects }) {
  const retry = getService('retry');
  const { visualBuilder, timePicker } = getPageObjects(['common', 'visualize', 'header', 'settings', 'visualBuilder', 'timePicker']);

  describe('visual builder', function describeIndexTests() {

    describe('markdown', () => {

      before(async () => {
        await visualBuilder.resetPage();
        await visualBuilder.clickMarkdown();
        await timePicker.setAbsoluteRange('2015-09-22 06:00:00.000', '2015-09-22 11:00:00.000');
      });

      it('should render all markdown components', async () => {
        const tabs = await visualBuilder.getSubTabs();
        expect(tabs.length).to.be(3);
      });

      it('should allow printing raw timestamp of data', async () => {
        await retry.try(async () => {
          await visualBuilder.enterMarkdown('{{ count.data.raw.[0].[0] }}');
          const text = await visualBuilder.getMarkdownText();
          expect(text).to.be('1442901600000');
        });
      });

      it('should allow printing raw value of data', async () => {
        await visualBuilder.enterMarkdown('{{ count.data.raw.[0].[1] }}');
        const text = await visualBuilder.getMarkdownText();
        expect(text).to.be('6');
      });

      // must be fail after fix: https://github.com/elastic/kibana/issues/30625
      it('should show empty table variables', async () => {
        const variables = await visualBuilder.getMarkdownTableVariables();
        expect(Array.isArray(variables)).to.be.ok();
        expect(variables).to.be.empty();

        const noVariables = await visualBuilder.getMarkdownTableNoVariables();
        expect(noVariables).to.be.contain('No variables available for the selected data metrics');
      });

      it('should render html as plain text', async () => {
        const html = '<h1>hello world</h1>';
        await visualBuilder.enterMarkdown(html);
        const markdownText = await visualBuilder.getMarkdownText();
        expect(markdownText).to.be(html);
      });

      it('should render mustache list', async () => {
        const list =
          `{{#each _all}}
{{ data.formatted.[0] }} {{ data.raw.[0] }}
{{/each}}`;

        const expectedRenderer = 'Sep 22, 2015 @ 06:00:00.000,6 1442901600000,6';

        await visualBuilder.enterMarkdown(list);
        const markdownText = await visualBuilder.getMarkdownText();
        expect(markdownText).to.be(expectedRenderer);
      });
    });
  });
}
