import DocumentsMigration from '../tasks/views/project/components/DocumentsMigration';

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <DocumentsMigration />
      </div>
    </div>
  );
}