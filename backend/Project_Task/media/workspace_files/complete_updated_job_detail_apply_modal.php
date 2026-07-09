<?php
$db = \Config\Database::connect();

$limit = 8;

$jobLimiter = function ($text, $limit = 35) {
    $text = trim(strip_tags((string)$text));

    if (function_exists('characterLimiter')) {
        return characterLimiter($text, $limit, '...');
    }

    if (mb_strlen($text) > $limit) {
        return mb_substr($text, 0, $limit) . '...';
    }

    return $text;
};

$jobField = function ($job, $field, $default = '') {
    return isset($job->{$field}) && $job->{$field} !== null && $job->{$field} !== '' ? $job->{$field} : $default;
};

$jobSalaryText = function ($job) use ($jobField) {
    $currency = $jobField($job, 'salary_currency', 'PKR');

    if (!empty($job->salary_min) || !empty($job->salary_max)) {
        $min = !empty($job->salary_min) ? $job->salary_min : '0';
        $max = !empty($job->salary_max) ? $job->salary_max : '0';
        return trim($currency . ' ' . $min . ' - ' . $max);
    }

    if (!empty($job->salary)) {
        return $job->salary;
    }

    return 'Salary not mentioned';
};

$cleanDetailText = function ($text) {
    $text = trim(strip_tags((string)$text));
    return $text !== '' ? $text : 'Not mentioned';
};

$renderJobCard = function ($job, $subClass, $jobLimiter, $jobField, $jobSalaryText, $cleanDetailText) {
    $jobId = !empty($job->id) ? (int)$job->id : uniqid();

    $detailPayload = [
        'id' => $jobId,
        'slug' => $jobField($job, 'slug'),
        'title' => $cleanDetailText($jobField($job, 'job_title', 'Job Title')),
        'company' => $cleanDetailText($jobField($job, 'company_name', 'Company')),
        'country' => $cleanDetailText($jobField($job, 'country_name')),
        'category' => $cleanDetailText($jobField($job, 'job_category_name')),
        'pillar_category' => $cleanDetailText($jobField($job, 'pillar_category_name')),
        'salary' => $cleanDetailText($jobSalaryText($job)),
        'job_type' => $cleanDetailText($jobField($job, 'job_type')),
        'job_level' => $cleanDetailText($jobField($job, 'job_level')),
        'experience' => $cleanDetailText($jobField($job, 'experience')),
        'qualification' => $cleanDetailText($jobField($job, 'qualification')),
        'skills' => $cleanDetailText($jobField($job, 'skills')),
        'deadline' => $cleanDetailText($jobField($job, 'application_deadline')),
        'website' => $cleanDetailText($jobField($job, 'company_website')),
        'email' => $cleanDetailText($jobField($job, 'company_email')),
        'phone' => $cleanDetailText($jobField($job, 'company_phone')),
        'location' => $cleanDetailText($jobField($job, 'location')),
        'description' => $cleanDetailText($jobField($job, 'description', $jobField($job, 'job_description'))),
        'responsibilities' => $cleanDetailText($jobField($job, 'responsibilities')),
        'requirements' => $cleanDetailText($jobField($job, 'requirements')),
        'apply_url' => base_url('job/apply/' . $jobField($job, 'slug'))
    ];

    ob_start();
    ?>
    <div class="<?= esc($subClass); ?> fintech-job-board-col">
        <div class="fintech-job-card fintech-job-open-detail"
             role="button"
             tabindex="0"
             data-job-id="<?= esc($jobId); ?>"
             aria-label="View job details">

            <script type="application/json" class="fintech-job-detail-payload">
                <?= json_encode($detailPayload, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT); ?>
            </script>

            <div class="fintech-job-company-box">
                <strong>
                    <?= !empty($job->company_name) ? esc($jobLimiter($job->company_name, 18)) : 'Company'; ?>
                </strong>
            </div>

            <div class="fintech-job-card-body">
                <div class="fintech-job-plus">+</div>

                <h4 class="fintech-job-card-title">
                    <?= esc($jobLimiter($job->job_title ?? 'Job Title', 35)); ?>
                </h4>

                <div class="fintech-job-bottom-wrap">
                    <div class="fintech-job-info-wrap">

                        <div class="fintech-job-info-card fintech-job-salary-card">
                            <div class="fintech-job-avatar">
                                <?php if (!empty($job->company_logo)): ?>
                                    <img src="<?= base_url($job->company_logo); ?>" alt="<?= esc($job->company_name ?? 'Company'); ?>">
                                <?php else: ?>
                                    <span><?= esc(mb_substr($job->job_title ?? 'J', 0, 1)); ?></span>
                                <?php endif; ?>
                            </div>

                            <small>
                                <?php if (!empty($job->salary_min) || !empty($job->salary_max)): ?>
                                    <?= esc($job->salary_currency ?? 'PKR'); ?>
                                    <?= esc($job->salary_min ?? '0'); ?> - <?= esc($job->salary_max ?? '0'); ?>
                                <?php elseif (!empty($job->salary)): ?>
                                    <?= esc($jobLimiter($job->salary, 14)); ?>
                                <?php else: ?>
                                    Salary
                                <?php endif; ?>
                            </small>

                            <div class="fintech-job-card-icons">
                                <span></span>
                                <em></em>
                            </div>
                        </div>

                        <div class="fintech-job-info-card fintech-job-desc-card">
                            <div class="fintech-job-avatar">
                                <?php if (!empty($job->company_logo)): ?>
                                    <img src="<?= base_url($job->company_logo); ?>" alt="<?= esc($job->company_name ?? 'Company'); ?>">
                                <?php else: ?>
                                    <span><?= esc(mb_substr($job->job_title ?? 'J', 0, 1)); ?></span>
                                <?php endif; ?>
                            </div>

                            <small>
                                <?= !empty($job->job_type) ? esc($jobLimiter($job->job_type, 14)) : 'Job Type'; ?>
                            </small>

                            <div class="fintech-job-card-icons">
                                <span></span>
                                <em></em>
                            </div>
                        </div>

                    </div>

                    <div class="fintech-job-more-wrap">
                        <span class="fintech-job-more-btn">show more</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
};

/*
|--------------------------------------------------------------------------
| JOB BOARD DATA
|--------------------------------------------------------------------------
| job_board_main_pillars = Job Categories / Parent Categories
| job_categories         = Pillar Categories / Child Categories
| jobs                   = Actual Jobs
|--------------------------------------------------------------------------
*/

$jobCategories = $db->table('job_board_main_pillars')
    ->where('status', 1)
    ->where('show_on_homepage', 1)
    ->where('block_type', 'block-4')
    ->orderBy('order_num', 'ASC')
    ->orderBy('id', 'ASC')
    ->get()
    ->getResult();

$pillarCategories = $db->table('job_categories')
    ->where('status', 1)
    ->orderBy('parent_id', 'ASC')
    ->orderBy('order_num', 'ASC')
    ->orderBy('id', 'ASC')
    ->get()
    ->getResult();

$jobs = $db->table('jobs j')
    ->select('
        j.*,
        c.country_name,
        jc.name AS pillar_category_name,
        jc.slug AS pillar_category_slug,
        mp.name AS job_category_name,
        mp.slug AS job_category_slug
    ')
    ->join('countries c', 'c.id = j.country_id', 'left')
    ->join('job_categories jc', 'jc.id = j.category_id', 'left')
    ->join('job_board_main_pillars mp', 'mp.id = j.category_pillar_id', 'left')
    ->where('j.status', 1)
    ->where('j.visibility', 1)
    ->orderBy('j.is_featured', 'DESC')
    ->orderBy('j.is_urgent', 'DESC')
    ->orderBy('j.id', 'DESC')
    ->get()
    ->getResult();

$jobsByCategory = [];
$jobsByPillar   = [];

if (!empty($jobs)) {
    foreach ($jobs as $job) {
        if (!empty($job->category_pillar_id)) {
            $jobsByCategory[$job->category_pillar_id][] = $job;
        }
        if (!empty($job->category_id)) {
            $jobsByPillar[$job->category_id][] = $job;
        }
    }
}
?>

<?php if (!empty($jobCategories)): ?>
    <?php foreach ($jobCategories as $jobCategory): ?>

        <?php
        $categoryPillars = [];
        if (!empty($pillarCategories)) {
            foreach ($pillarCategories as $pillar) {
                if ($pillar->parent_id == $jobCategory->id) {
                    $categoryPillars[] = $pillar;
                }
            }
        }

        $categoryJobs = $jobsByCategory[$jobCategory->id] ?? [];
        $categoryWidgets = getCategoryWidgets($jobCategory->id, $baseWidgets, $adSpaces, $activeLang->id);

        $mainClass = 'col-sm-12';
        $subClass  = 'col-sm-12 col-md-6 col-lg-4';

        if ($categoryWidgets->hasWidgets) {
            $mainClass = 'col-sm-12 col-md-12 col-lg-12';
            $subClass  = 'col-sm-12 col-md-6 col-lg-6';
            $limit     = 9;
        }
        ?>

        <div class="section section-category fintech-job-board-section">
            <div class="container-xl">
                <div class="row">
                    <div class="<?= esc($mainClass); ?>">

                        <div class="fintech-job-board-header">
                            <h3 class="fintech-job-board-title">
                                <?= esc($jobCategory->name); ?>
                            </h3>

                            <div class="fintech-job-board-filter">
                                <select class="fintech-job-board-select" id="jobBoardCategorySelect<?= esc($jobCategory->id); ?>">
                                    <option value="#tabCategoryAll<?= esc($jobCategory->id); ?>">
                                        All Category
                                    </option>
                                    <?php if (!empty($categoryPillars)): ?>
                                        <?php foreach ($categoryPillars as $pillar): ?>
                                            <option value="#tabCategory<?= esc($pillar->id); ?>">
                                                <?= esc($pillar->name); ?>
                                            </option>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </select>
                            </div>
                        </div>

                        <div class="fintech-job-board-content">
                            <div class="tab-content">

                                <div class="tab-pane fade show active"
                                     id="tabCategoryAll<?= esc($jobCategory->id); ?>"
                                     role="tabpanel">

                                    <div class="row fintech-job-board-row">
                                        <?php if (!empty($categoryJobs)): ?>
                                            <?php $i = 0; ?>
                                            <?php foreach ($categoryJobs as $job): ?>
                                                <?php if ($i < $limit): ?>
                                                    <?= $renderJobCard($job, $subClass, $jobLimiter, $jobField, $jobSalaryText, $cleanDetailText); ?>
                                                <?php endif; ?>
                                                <?php $i++; ?>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <div class="col-12">
                                                <p class="fintech-job-empty">
                                                    <?= trans("no_records_found"); ?>
                                                </p>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <?php if (!empty($categoryPillars)): ?>
                                    <?php foreach ($categoryPillars as $pillar): ?>
                                        <?php $pillarJobs = $jobsByPillar[$pillar->id] ?? []; ?>

                                        <div class="tab-pane fade"
                                             id="tabCategory<?= esc($pillar->id); ?>"
                                             role="tabpanel">

                                            <div class="row fintech-job-board-row">
                                                <?php if (!empty($pillarJobs)): ?>
                                                    <?php $i = 0; ?>
                                                    <?php foreach ($pillarJobs as $job): ?>
                                                        <?php if ($i < $limit): ?>
                                                            <?= $renderJobCard($job, $subClass, $jobLimiter, $jobField, $jobSalaryText, $cleanDetailText); ?>
                                                        <?php endif; ?>
                                                        <?php $i++; ?>
                                                    <?php endforeach; ?>
                                                <?php else: ?>
                                                    <div class="col-12">
                                                        <p class="fintech-job-empty">
                                                            <?= trans("no_records_found"); ?>
                                                        </p>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>

                                    <?php endforeach; ?>
                                <?php endif; ?>

                            </div>
                        </div>

                    </div>

                    <?php if ($categoryWidgets->hasWidgets): ?>
                        <?= loadView('partials/_sidebar_category', ['objectWidgets' => $categoryWidgets]); ?>
                    <?php endif; ?>

                </div>
            </div>
        </div>

    <?php endforeach; ?>
<?php else: ?>
    <div class="section section-category fintech-job-board-section">
        <div class="container-xl">
            <p class="fintech-job-empty">No job categories found.</p>
        </div>
    </div>
<?php endif; ?>

<div class="fintech-job-modal" id="fintechJobDetailModal" aria-hidden="true">
    <div class="fintech-job-modal-backdrop" data-job-modal-close></div>

    <div class="fintech-job-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="fintechJobModalTitle">
        <button type="button" class="fintech-job-modal-close" data-job-modal-close aria-label="Close">×</button>

        <div class="fintech-job-modal-header">
            <span class="fintech-job-modal-company" id="fintechJobModalCompany">Company</span>
            <h3 id="fintechJobModalTitle">Job Title</h3>
            <p id="fintechJobModalLocation">Location</p>
        </div>

        <div class="fintech-job-modal-body">
            <div class="fintech-job-detail-grid" id="fintechJobDetailGrid"></div>

            <div class="fintech-job-detail-section">
                <h4>Job Description</h4>
                <p id="fintechJobDescription">Not mentioned</p>
            </div>

            <div class="fintech-job-detail-section" id="fintechJobResponsibilitiesWrap">
                <h4>Responsibilities</h4>
                <p id="fintechJobResponsibilities">Not mentioned</p>
            </div>

            <div class="fintech-job-detail-section" id="fintechJobRequirementsWrap">
                <h4>Requirements</h4>
                <p id="fintechJobRequirements">Not mentioned</p>
            </div>

            <div class="fintech-job-modal-actions">
                <button type="button" class="fintech-job-apply-toggle" id="fintechJobApplyToggle">Apply Now</button>
            </div>

            <div class="fintech-job-apply-form-wrap" id="fintechJobApplyFormWrap">
                <h4>Apply for this job</h4>

                <form class="fintech-job-apply-form" id="fintechJobApplyForm" method="post" enctype="multipart/form-data">
                    <?= csrf_field(); ?>
                    <input type="hidden" name="job_id" id="fintechApplyJobId">
                    <input type="hidden" name="job_title" id="fintechApplyJobTitle">

                    <div class="fintech-job-form-row">
                        <div class="fintech-job-form-group">
                            <label>Full Name</label>
                            <input type="text" name="full_name" placeholder="Enter your full name" required>
                        </div>

                        <div class="fintech-job-form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" placeholder="Enter your email" required>
                        </div>
                    </div>

                    <div class="fintech-job-form-row">
                        <div class="fintech-job-form-group">
                            <label>Phone Number</label>
                            <input type="text" name="phone" placeholder="Enter your phone number" required>
                        </div>

                        <div class="fintech-job-form-group">
                            <label>Upload CV</label>
                            <input type="file" name="cv_file" accept=".pdf,.doc,.docx">
                        </div>
                    </div>

                    <div class="fintech-job-form-group">
                        <label>Message / Cover Letter</label>
                        <textarea name="message" rows="4" placeholder="Write your short message"></textarea>
                    </div>

                    <button type="submit" class="fintech-job-submit-btn">Submit Application</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.fintech-job-board-select').forEach(function (select) {
        select.addEventListener('change', function () {
            const targetId = this.value;
            const section = this.closest('.fintech-job-board-section');

            if (!section || !targetId) {
                return;
            }

            section.querySelectorAll('.tab-pane').forEach(function (pane) {
                pane.classList.remove('show', 'active');
            });

            const targetPane = section.querySelector(targetId);

            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
    });

    const modal = document.getElementById('fintechJobDetailModal');
    const modalCompany = document.getElementById('fintechJobModalCompany');
    const modalTitle = document.getElementById('fintechJobModalTitle');
    const modalLocation = document.getElementById('fintechJobModalLocation');
    const detailGrid = document.getElementById('fintechJobDetailGrid');
    const description = document.getElementById('fintechJobDescription');
    const responsibilities = document.getElementById('fintechJobResponsibilities');
    const requirements = document.getElementById('fintechJobRequirements');
    const applyToggle = document.getElementById('fintechJobApplyToggle');
    const applyFormWrap = document.getElementById('fintechJobApplyFormWrap');
    const applyForm = document.getElementById('fintechJobApplyForm');
    const applyJobId = document.getElementById('fintechApplyJobId');
    const applyJobTitle = document.getElementById('fintechApplyJobTitle');

    function safeValue(value) {
        return value && value !== 'Not mentioned' ? value : 'Not mentioned';
    }

    function openModal(data) {
        modalCompany.textContent = safeValue(data.company);
        modalTitle.textContent = safeValue(data.title);
        modalLocation.textContent = [data.location, data.country].filter(function (item) {
            return item && item !== 'Not mentioned';
        }).join(' • ') || 'Location not mentioned';

        const detailItems = [
            ['Salary', data.salary],
            ['Job Type', data.job_type],
            ['Job Level', data.job_level],
            ['Experience', data.experience],
            ['Qualification', data.qualification],
            ['Skills', data.skills],
            ['Category', data.category],
            ['Pillar Category', data.pillar_category],
            ['Application Deadline', data.deadline],
            ['Company Email', data.email],
            ['Company Phone', data.phone],
            ['Company Website', data.website]
        ];

        detailGrid.innerHTML = detailItems.map(function (item) {
            return '<div class="fintech-job-detail-item"><span>' + item[0] + '</span><strong>' + safeValue(item[1]) + '</strong></div>';
        }).join('');

        description.textContent = safeValue(data.description);
        responsibilities.textContent = safeValue(data.responsibilities);
        requirements.textContent = safeValue(data.requirements);

        applyJobId.value = data.id || '';
        applyJobTitle.value = data.title || '';
        applyForm.action = data.apply_url || '#';
        applyFormWrap.classList.remove('active');

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('fintech-job-modal-open');
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('fintech-job-modal-open');
        applyFormWrap.classList.remove('active');
    }

    document.querySelectorAll('.fintech-job-open-detail').forEach(function (card) {
        card.addEventListener('click', function () {
            const payload = card.querySelector('.fintech-job-detail-payload');
            if (!payload) {
                return;
            }

            try {
                openModal(JSON.parse(payload.textContent));
            } catch (e) {
                console.warn('Invalid job detail data', e);
            }
        });

        card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                card.click();
            }
        });
    });

    document.querySelectorAll('[data-job-modal-close]').forEach(function (item) {
        item.addEventListener('click', closeModal);
    });

    applyToggle.addEventListener('click', function () {
        applyFormWrap.classList.toggle('active');
        if (applyFormWrap.classList.contains('active')) {
            applyFormWrap.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
</script>

<style>
.fintech-job-board-section {
    padding: clamp(35px, 5vw, 70px) 0;
    background: #ffffff;
}

.fintech-job-board-section .container-xl {
    max-width: 1240px;
}

.fintech-job-board-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: clamp(25px, 4vw, 45px);
}

.fintech-job-board-title {
    margin: 0;
    color: #151922;
    font-size: clamp(24px, 3vw, 36px);
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-transform: uppercase;
}

.fintech-job-board-filter {
    position: relative;
    width: 260px;
    max-width: 100%;
}

.fintech-job-board-select {
    width: 100%;
    min-height: 38px;
    border: 1px solid #e7e7e7;
    background: #ffffff;
    color: #111111;
    font-size: clamp(13px, 1.2vw, 15px);
    font-weight: 600;
    border-radius: 0;
    padding: 7px 12px;
    outline: none;
    cursor: pointer;
    box-shadow: none;
}

.fintech-job-board-select option {
    font-size: 14px;
    font-weight: 700;
    color: #000000;
    background: #ffffff;
}

.fintech-job-board-row {
    row-gap: clamp(75px, 6vw, 105px);
}

.fintech-job-board-col {
    display: flex;
    justify-content: center;
}

.fintech-job-card {
    position: relative;
    width: 100%;
    max-width: 430px;
    min-height: 285px;
    display: block;
    text-decoration: none !important;
    color: inherit;
    padding-top: 45px;
    transition: 0.25s ease;
    cursor: pointer;
}

.fintech-job-card:hover,
.fintech-job-card:focus {
    transform: translateY(-5px);
    outline: none;
}

.fintech-job-card-body {
    position: relative;
    min-height: 220px;
    background: #000000;
    border-radius: 12px;
    padding: 70px 28px 28px;
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12);
    overflow: visible;
}

.fintech-job-company-box {
    position: absolute;
    top: 0;
    right: 34px;
    z-index: 5;
    width: 178px;
    min-height: 80px;
    background: #ffffff;
    border-radius: 4px;
    padding: 24px 20px;
    box-shadow: 0 13px 35px rgba(0, 0, 0, 0.08);
    color: #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.fintech-job-company-box span,
.fintech-job-company-box strong {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    font-size: clamp(12px, 1vw, 15px);
    line-height: 1.2;
    font-weight: 700;
}

.fintech-job-plus {
    position: absolute;
    left: 50%;
    top: 78px;
    transform: translateX(-50%);
    color: #ffffff;
    font-size: 42px;
    line-height: 1;
    font-weight: 300;
}

.fintech-job-card-title {
    margin: 0;
    padding-top: 28px;
    color: #ffffff;
    font-size: clamp(18px, 1.6vw, 24px);
    line-height: 1.35;
    font-weight: 800;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
}

.fintech-job-bottom-wrap {
    position: absolute;
    left: -22px;
    right: 20px;
    bottom: -50px;
    z-index: 6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
}

.fintech-job-info-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
}

.fintech-job-info-card {
    position: relative;
    width: 100px;
    min-width: 100px;
    min-height: 92px;
    background: #ffffff;
    border-radius: 5px;
    padding: 36px 12px 12px;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.11);
    overflow: hidden;
}

.fintech-job-desc-card {
    width: 112px;
    min-width: 112px;
}

.fintech-job-avatar {
    position: absolute;
    top: -18px;
    left: 12px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #efefef;
    border: 2px solid #ffffff;
    overflow: hidden;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.18);
}

.fintech-job-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.fintech-job-avatar span {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2f7d8c;
    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
}

.fintech-job-info-card small {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    color: #000000;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 800;
    min-height: 28px;
}

.fintech-job-card-icons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
}

.fintech-job-card-icons span {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2c2c2c;
    display: block;
    flex: 0 0 auto;
}

.fintech-job-card-icons em {
    width: 26px;
    height: 4px;
    border-radius: 20px;
    background: #d9d9d9;
    display: block;
    flex: 0 0 auto;
}

.fintech-job-more-wrap {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fintech-job-more-btn {
    min-width: 125px;
    height: 34px;
    border-radius: 2px;
    background: #155dff;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    text-transform: lowercase;
    white-space: nowrap;
}

.fintech-job-empty {
    margin: 20px 0;
    color: #777777;
    font-size: 15px;
    font-weight: 500;
    text-align: center;
}

.fintech-job-board-section .sidebar,
.fintech-job-board-section aside {
    margin-top: 105px;
}

body.fintech-job-modal-open {
    overflow: hidden;
}

.fintech-job-modal {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.fintech-job-modal.active {
    display: flex;
}

.fintech-job-modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
}

.fintech-job-modal-dialog {
    position: relative;
    z-index: 2;
    width: min(920px, 100%);
    max-height: 90vh;
    overflow-y: auto;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.28);
}

.fintech-job-modal-close {
    position: sticky;
    top: 14px;
    left: calc(100% - 54px);
    z-index: 5;
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 50%;
    background: #000000;
    color: #ffffff;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
}

.fintech-job-modal-header {
    padding: 28px 34px 22px;
    background: #000000;
    color: #ffffff;
    border-radius: 16px 16px 0 0;
}

.fintech-job-modal-company {
    display: inline-flex;
    margin-bottom: 10px;
    padding: 7px 12px;
    border-radius: 30px;
    background: #155dff;
    color: #ffffff;
    font-size: 12px;
    line-height: 1;
    font-weight: 800;
}

.fintech-job-modal-header h3 {
    margin: 0 0 8px;
    color: #ffffff;
    font-size: clamp(24px, 3vw, 38px);
    line-height: 1.15;
    font-weight: 900;
}

.fintech-job-modal-header p {
    margin: 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 15px;
    font-weight: 600;
}

.fintech-job-modal-body {
    padding: 30px 34px 34px;
}

.fintech-job-detail-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 28px;
}

.fintech-job-detail-item {
    min-height: 88px;
    border: 1px solid #eeeeee;
    border-radius: 10px;
    padding: 14px;
    background: #fafafa;
}

.fintech-job-detail-item span {
    display: block;
    margin-bottom: 7px;
    color: #777777;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 800;
    text-transform: uppercase;
}

.fintech-job-detail-item strong {
    display: block;
    color: #111111;
    font-size: 14px;
    line-height: 1.35;
    font-weight: 800;
    overflow-wrap: anywhere;
}

.fintech-job-detail-section {
    margin-top: 22px;
}

.fintech-job-detail-section h4,
.fintech-job-apply-form-wrap h4 {
    margin: 0 0 10px;
    color: #111111;
    font-size: 20px;
    line-height: 1.25;
    font-weight: 900;
}

.fintech-job-detail-section p {
    margin: 0;
    color: #444444;
    font-size: 15px;
    line-height: 1.75;
    font-weight: 500;
    white-space: pre-line;
    overflow-wrap: anywhere;
}

.fintech-job-modal-actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.fintech-job-apply-toggle,
.fintech-job-submit-btn {
    min-width: 160px;
    height: 46px;
    border: 0;
    border-radius: 6px;
    background: #155dff;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    font-weight: 800;
    cursor: pointer;
}

.fintech-job-apply-form-wrap {
    display: none;
    margin-top: 28px;
    padding: 24px;
    border-radius: 12px;
    background: #f7f8fb;
    border: 1px solid #eeeeee;
}

.fintech-job-apply-form-wrap.active {
    display: block;
}

.fintech-job-form-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.fintech-job-form-group {
    margin-bottom: 16px;
}

.fintech-job-form-group label {
    display: block;
    margin-bottom: 7px;
    color: #111111;
    font-size: 13px;
    font-weight: 800;
}

.fintech-job-form-group input,
.fintech-job-form-group textarea {
    width: 100%;
    border: 1px solid #dddddd;
    border-radius: 7px;
    background: #ffffff;
    color: #111111;
    font-size: 14px;
    font-weight: 500;
    padding: 12px 13px;
    outline: none;
}

.fintech-job-form-group input:focus,
.fintech-job-form-group textarea:focus {
    border-color: #155dff;
}

@media (max-width: 1199.98px) {
    .fintech-job-card {
        max-width: 380px;
    }

    .fintech-job-company-box {
        right: 26px;
        width: 160px;
        min-height: 92px;
    }
}

@media (max-width: 991.98px) {
    .fintech-job-board-header {
        align-items: flex-start;
    }

    .fintech-job-board-filter {
        width: 240px;
    }

    .fintech-job-card {
        max-width: 390px;
    }

    .fintech-job-board-row {
        row-gap: 85px;
    }

    .fintech-job-detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 767.98px) {
    .fintech-job-board-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .fintech-job-board-filter {
        width: 100%;
        max-width: 320px;
    }

    .fintech-job-board-select {
        text-align: center;
    }

    .fintech-job-card {
        max-width: 390px;
    }

    .fintech-job-bottom-wrap {
        left: 10px;
        right: 18px;
    }

    .fintech-job-detail-grid,
    .fintech-job-form-row {
        grid-template-columns: 1fr;
    }

    .fintech-job-modal-body,
    .fintech-job-modal-header {
        padding-left: 20px;
        padding-right: 20px;
    }
}

@media (max-width: 575.98px) {
    .fintech-job-board-section {
        padding: 35px 0 65px;
    }

    .fintech-job-card {
        max-width: 335px;
        min-height: 250px;
        padding-top: 36px;
    }

    .fintech-job-card-body {
        min-height: 190px;
        padding: 58px 18px 22px;
    }

    .fintech-job-company-box {
        right: 20px;
        width: 142px;
        min-height: 82px;
        padding: 18px 14px;
    }

    .fintech-job-plus {
        top: 65px;
    }

    .fintech-job-card-title {
        padding-top: 24px;
        font-size: clamp(16px, 5vw, 20px);
    }

    .fintech-job-bottom-wrap {
        left: 0;
        right: 10px;
        bottom: -44px;
        gap: 8px;
    }

    .fintech-job-info-wrap {
        gap: 8px;
    }

    .fintech-job-info-card {
        width: 82px;
        min-width: 82px;
        min-height: 78px;
        padding: 30px 8px 10px;
    }

    .fintech-job-desc-card {
        width: 92px;
        min-width: 92px;
    }

    .fintech-job-more-btn {
        min-width: 98px;
        height: 28px;
        font-size: 11px;
    }

    .fintech-job-modal {
        padding: 10px;
    }

    .fintech-job-modal-dialog {
        max-height: 94vh;
        border-radius: 12px;
    }

    .fintech-job-modal-header {
        border-radius: 12px 12px 0 0;
    }

    .fintech-job-apply-form-wrap {
        padding: 18px;
    }
}
</style>
