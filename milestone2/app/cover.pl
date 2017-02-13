#!/usr/bin/perl

use strict;
my $tap_file = "test.tap";
open(FILE, $tap_file) or die "Could not open file\n";

my @output_array = ();
while (my $line = <FILE> ) {
	push (@output_array, $line);
}

my $target_coverage = 70.00;
foreach my $line (@output_array) {
	if ($line =~ m/([a-zA-Z]+)\s+:\s+(\d+\.\d+)%/) {
		my $percentage = sprintf ("%.2f", $2);
		my $category = $1;
		my $op;
		if ($category =~ /Statement/) {
			if ($percentage < $target_coverage) {
				print "Failing build because $category coverage is less than".
					" threshold of $target_coverage%\n";
				print "Actual Statement coverage: $percentage\n";
				exit(1);
			} else {
				$op = sprintf "%-11s - %s", $category, $percentage;
			}	
		} else {
			$op = sprintf "%-11s - %s", $category, $percentage;

		}
		
		print "$op%\n";
	} elsif ($line =~ m/([a-zA-Z]+)\s+:\s+(\d+)%/) {

		my $percentage = sprintf ("%.2f", $2);
		my $category = $1;
		my $op;
		if ($category =~ /Statement/) {
			if ($percentage < $target_coverage) {
				exit(1);
			} else {
				$op = sprintf "%-11s - %d", $category, $percentage;
			}
		} else {
			$op = sprintf "%-11s - %d", $category, $percentage;
		}
		
		print "$op%\n";
	}
}

close(FILE);
