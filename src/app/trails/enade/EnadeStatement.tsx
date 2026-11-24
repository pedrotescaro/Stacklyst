import type { EnadeQuestionContent, EnadeStatementBlock } from '@/lib/enade/types';
import styles from './EnadeCourse.module.css';

function StatementBlock({ block }: { block: EnadeStatementBlock }) {
  switch (block.kind) {
    case 'list': {
      const List = block.items.every(({ marker }) => marker === '•') ? 'ul' : 'ol';
      return (
        <List className={styles.statementList} role="list">
          {block.items.map(({ marker, text }, index) => (
            <li key={index}>
              <span className={styles.statementMarker}>{marker}</span>
              <span className={styles.statementLines}>{text}</span>
            </li>
          ))}
        </List>
      );
    }
    case 'table':
      return (
        <table className={styles.statementTable}>
          <thead>
            <tr>
              {block.headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, columnIndex) => (
                  <td key={columnIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'heading':
      return <h4>{block.text}</h4>;
    case 'source':
      return <p className={styles.statementSource}>{block.text}</p>;
    case 'code':
      return (
        <pre className={styles.statementCode}>
          <code>{block.text}</code>
        </pre>
      );
    case 'lines':
      return <p className={styles.statementLines}>{block.text}</p>;
    case 'paragraph':
      return <p>{block.text}</p>;
  }
}

export function EnadeStatement({ content }: { content: EnadeQuestionContent }) {
  return (
    <section className={styles.statement} aria-labelledby="statement-title">
      <h3 id="statement-title">Enunciado</h3>
      <div className={styles.statementBody}>
        {content.formattedStatement?.length ? (
          content.formattedStatement.map((block, index) => (
            <StatementBlock block={block} key={index} />
          ))
        ) : (
          <p className={styles.statementLines}>{content.transcript || content.statement}</p>
        )}
      </div>
    </section>
  );
}
