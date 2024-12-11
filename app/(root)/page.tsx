import Image from "next/image";
import Link from "next/link";
import { StorageChart } from "@/components/storage-chart";
import FormattedDateTime from "@/components/formatted-date-time";
import { Separator } from "@/components/ui/separator";
import { getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getUsageSummary } from "@/lib/utils";

const Dashboard = async () => {
  // Parallel requests
  const totalSpace = await getTotalSpaceUsed();

  // Get usage summary
  const usageSummary = getUsageSummary(totalSpace!);

  return (
    <div className="dashboard-container">
      <section>
        <StorageChart used={totalSpace!.used} />

        {/* Uploaded file type summaries */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="dashboard-summary-card"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="summary-type-icon"
                  />
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                <h5 className="summary-type-title">{summary.title}</h5>
                <Separator className="bg-light-400" />
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      <section className="dashboard-recent-files">
        {/* Recent files uploaded */}
      </section>
    </div>
  );
};

export default Dashboard;
