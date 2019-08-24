import React from 'react';
import { graphql } from 'gatsby';
import { connect } from 'react-redux';
import { pushNewPage, pushNewQuery } from '../state/app';

import Shell from '../components/Shell';
import Meta from '../components/Meta';
import Search from '../components/Search';
import SnippetCard from '../components/SnippetCard';

import { getRawCodeBlocks as getCodeBlocks } from '../util';

// ===================================================
// Home page (splash and search)
// ===================================================
const IndexPage = props => {
  console.log(props);
  const snippets = props.data.snippetDataJson.data.map(snippet => ({
    title: snippet.title,
    html: props.data.allMarkdownRemark.edges.find(
      v => v.node.frontmatter.title === snippet.title,
    ).node.html,
    tags: snippet.attributes.tags,
    text: snippet.attributes.text,
    id: snippet.id,
    code: snippet.attributes.codeBlocks,
    supportPercentage: snippet.attributes.browserSupport.supportPercentage,
  }));

  const [searchQuery, setSearchQuery] = React.useState(props.searchQuery);
  const [searchResults, setSearchResults] = React.useState(snippets);

  React.useEffect(() => {
    props.dispatch(pushNewQuery(searchQuery));
    let q = searchQuery.toLowerCase();
    let results = snippets;
    if (q.trim().length)
      results = snippets.filter(
        v =>
          v.tags.filter(t => t.indexOf(q) !== -1).length ||
          v.title.toLowerCase().indexOf(q) !== -1,
      );
    setSearchResults(results);
  }, [searchQuery]);

  React.useEffect(() => {
    props.dispatch(pushNewPage('Search', '/search'));
  }, []);

  return (
    <>
      <Meta 
        meta={[{ name: `google-site-verification`, content: `ADD YOUR VERIFICATION CODE HERE` }]}
      />
      <Shell withIcon={false} withTitle={false}>
        <div className='splash'>
          <div className='splash-container'>
            <img className='splash-leaves' id='splash-leaves-1' src={props.data.leaves1.childImageSharp.original.src} alt='splash-leaves-1' />
            <img className='splash-leaves' id='splash-leaves-2' src={props.data.leaves2.childImageSharp.original.src} />
            <img id='splash-blob' src={props.data.blob.childImageSharp.original.src} alt='splash-blob' />
            <div className='splash-content'>
              <img
                src={props.data.file.childImageSharp.original.src} alt='Logo' className='splash-logo'
              />
              <h1 className='splash-title'
                dangerouslySetInnerHTML={{ 
                  __html: `${props.data.site.siteMetadata.title.replace('CSS','<strong>CSS</strong>')}`
                }} 
              />
              <p className='splash-sub-title'>
                {props.data.site.siteMetadata.description}
              </p>
            </div>
          </div>
        </div>
        <Search
          setSearchQuery={setSearchQuery}
          defaultValue={props.searchQuery}
        />
        {searchQuery.length === 0 ? (
          <p className='light-sub'>
            Start typing a keyword to see matching snippets.
          </p>
        ) : searchResults.length === 0 ? (
          <p className='light-sub'>
            We couldn't find any results for the keyword{' '}
            <strong>{searchQuery}</strong>.
          </p>
        ) : (
          <>
            <p className='light-sub'>
              Click on a snippet's name to view its code.
            </p>
            <h2 className='page-sub-title'>Search results</h2>
            {searchResults.map(snippet => (
              <SnippetCard
                short
                key={`snippet_${snippet.id}`}
                snippetData={snippet}
                isDarkMode={props.isDarkMode}
              />
            ))}
          </>
        )}
      </Shell>
    </>
  );
};

export default connect(
  state => ({
    isDarkMode: state.app.isDarkMode,
    lastPageTitle: state.app.lastPageTitle,
    lastPageUrl: state.app.lastPageUrl,
    searchQuery: state.app.searchQuery,
  }),
  null,
)(IndexPage);

export const indexPageQuery = graphql`
  query snippetList {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
    file(relativePath: { eq: "30s-icon.png" }) {
      id
      childImageSharp {
        original {
          src
        }
      }
    }
    leaves1 : file(relativePath: { eq: "leaves1.png" }) {
      id
      childImageSharp {
        original {
          src
        }
      }
    }
    leaves2 : file(relativePath: { eq: "leaves2.png" }) {
      id
      childImageSharp {
        original {
          src
        }
      }
    }
    blob : file(relativePath: { eq: "blob.png" }) {
      id
      childImageSharp {
        original {
          src
        }
      }
    }
    snippetDataJson(meta: { type: { eq: "snippetArray" } }) {
      data {
        id
        title
        attributes {
          tags
          text
          codeBlocks {
            html
            css
            js
            scopedCss
          }
          browserSupport {
            supportPercentage
          }
        }
      }
    }
    allMarkdownRemark(
      limit: 1000
      sort: { fields: [frontmatter___title], order: ASC }
    ) {
      totalCount
      edges {
        node {
          id
          html
          rawMarkdownBody
          fields {
            slug
          }
          frontmatter {
            title
            tags
          }
        }
      }
    }
  }
`;
